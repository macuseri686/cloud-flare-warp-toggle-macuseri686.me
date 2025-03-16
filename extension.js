/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

const WarpToggle = GObject.registerClass(
class WarpToggle extends QuickToggle {
    constructor() {
        super({
            title: _('CloudFlare Warp'),
            iconName: 'network-vpn-disconnected-symbolic',
            toggleMode: true,
        });
        
        // Add a flag to track programmatic updates
        this._updatingState = false;
        
        // Connect to the clicked event instead of toggled
        this.connect('clicked', () => {
            log('Toggle clicked, current checked state: ' + this.checked);
            
            // Only proceed if the toggle is reactive
            if (this.reactive && !this._updatingState) {
                // Temporarily disable the toggle until we know the result
                this.reactive = false;
                
                if (this.checked) {
                    // If currently checked, we want to connect (not disconnect)
                    log('Toggle is checked, connecting to Warp...');
                    this._connectWarp();
                } else {
                    // If currently unchecked, we want to disconnect (not connect)
                    log('Toggle is unchecked, disconnecting from Warp...');
                    this._disconnectWarp();
                }
            } else {
                log('Toggle clicked but ignored: reactive=' + this.reactive + 
                    ', updatingState=' + this._updatingState);
            }
        });
        
        // Perform an immediate initial check
        this._checkWarpStatus();
        
        // Then set up the regular interval check
        this._statusCheckId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            30, // Check every 30 seconds
            () => {
                this._checkWarpStatus();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }
    
    _connectWarp() {
        try {
            log('Executing warp-cli connect...');
            GLib.spawn_command_line_async('warp-cli connect');
            
            // Perform an immediate status check after attempting to connect
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
                log('Checking status after connect attempt...');
                this._checkWarpStatus(() => {
                    // Re-enable the toggle after status check
                    this.reactive = true;
                    log('Toggle re-enabled after connect');
                });
                return GLib.SOURCE_REMOVE;
            });
        } catch (e) {
            log('Failed to connect to Warp: ' + e.message);
            this.reactive = true; // Make sure to re-enable even on error
        }
    }
    
    _disconnectWarp() {
        try {
            log('Executing warp-cli disconnect...');
            GLib.spawn_command_line_async('warp-cli disconnect');
            
            // Perform an immediate status check after attempting to disconnect
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
                log('Checking status after disconnect attempt...');
                this._checkWarpStatus(() => {
                    // Re-enable the toggle after status check
                    this.reactive = true;
                    log('Toggle re-enabled after disconnect');
                });
                return GLib.SOURCE_REMOVE;
            });
        } catch (e) {
            log('Failed to disconnect from Warp: ' + e.message);
            this.reactive = true; // Make sure to re-enable even on error
        }
    }
    
    _checkWarpStatus(callback = null) {
        try {
            log('Checking Warp status...');
            let proc = Gio.Subprocess.new(
                ['warp-cli', 'status'],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            
            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                    let status = proc.get_exit_status();
                    
                    if (status === 0) {
                        let isConnected = stdout.includes('Status update: Connected');
                        log(`Warp status check: connected = ${isConnected}`);
                        
                        // Update the toggle state without triggering the clicked handler
                        this._updatingState = true;
                        this.checked = isConnected;
                        this._updatingState = false;
                        
                        // Update icon based on connection state
                        this.iconName = isConnected ? 
                            'weather-cloudy-symbolic' : 
                            'network-vpn-disconnected-symbolic';
                    } else {
                        log(`Warp status check failed with status ${status}: ${stderr}`);
                    }
                    
                    // Call the callback if provided
                    if (callback) {
                        callback();
                    } else {
                        // Always ensure the toggle is reactive
                        this.reactive = true;
                    }
                } catch (e) {
                    log('Error processing Warp status: ' + e.message);
                    this.reactive = true; // Re-enable on error
                    if (callback) {
                        callback();
                    }
                }
            });
        } catch (e) {
            log('Failed to check Warp status: ' + e.message);
            this.reactive = true; // Re-enable on error
            if (callback) {
                callback();
            }
        }
        
        return GLib.SOURCE_CONTINUE;
    }
    
    destroy() {
        if (this._statusCheckId) {
            GLib.source_remove(this._statusCheckId);
            this._statusCheckId = 0;
        }
        super.destroy();
    }
});

const WarpIndicator = GObject.registerClass(
class WarpIndicator extends SystemIndicator {
    constructor() {
        super();
        
        this._indicator = this._addIndicator();
        this._indicator.iconName = 'network-vpn-disconnected-symbolic';
        
        const toggle = new WarpToggle();
        
        // Update indicator when toggle state changes
        toggle.connect('notify::checked', () => {
            this._indicator.iconName = toggle.checked ? 
                'weather-cloudy-symbolic' : 
                'network-vpn-disconnected-symbolic';
            this._indicator.visible = true;
        });
        
        this.quickSettingsItems.push(toggle);
    }
});

export default class WarpToggleExtension extends Extension {
    enable() {
        this._indicator = new WarpIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }
    
    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
    }
}
