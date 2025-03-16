# CloudFlare Warp Toggle

A GNOME Shell extension that provides a quick toggle for connecting and disconnecting from CloudFlare Warp VPN service directly from your system menu.

## Features

- One-click toggle to connect/disconnect from CloudFlare Warp
- Status indicator showing current connection state
- Automatic status checks every 30 seconds
- Integration with GNOME Shell's quick settings menu

## Screenshots
![Screenshot from 2025-03-15 20-04-44](https://github.com/user-attachments/assets/02e7446a-98e9-4f59-a9f4-45d3eade13df)

## Requirements

- GNOME Shell 43 or later
- CloudFlare Warp CLI (`warp-cli`) installed and configured
- If you haven't installed Warp yet, follow the [official installation guide](https://developers.cloudflare.com/warp-client/get-started/linux/)

## Installation

### Manual Installation

1. Clone this repository:
```
git clone https://github.com/macuseri686/cloud-flare-warp-toggle-macuseri686.me.git
cd cloud-flare-warp-toggle
```

2. Install the extension:
```
mkdir -p ~/.local/share/gnome-shell/extensions/cloud-flare-warp-toggle@macuseri686.me
cp -r * ~/.local/share/gnome-shell/extensions/cloud-flare-warp-toggle@macuseri686.me/
```

3. Restart GNOME Shell:
   - Press `Alt+F2`, type `r`, and press Enter (X11)
   - Log out and log back in (Wayland)

4. Enable the extension:
```
gnome-extensions enable cloud-flare-warp-toggle@macuseri686.me
```
NOTE: If you are using Wayland, you need to log out and log back in.


## Usage

After installation, you'll find a new toggle in your system menu quick settings area:

1. Click on the CloudFlare Warp toggle to connect/disconnect
2. The icon will change to show connection status:
   - Cloud icon: Connected to Warp
   - VPN disconnected icon: Disconnected from Warp

## Troubleshooting

If you encounter issues with the extension, try these commands:

1. Reset and reload the extension:
```
gnome-extensions reset cloud-flare-warp-toggle@macuseri686.me
gnome-extensions enable cloud-flare-warp-toggle@macuseri686.me
```
NOTE: If you are using Wayland, you need to log out and log back in.

2. Check extension logs:
```
journalctl -b | grep -i "cloud-flare-warp-toggle@macuseri686.me" | tail -30
```

3. Check general GNOME Shell extension logs:
```
journalctl -b | grep -i "extension" | tail -30
```

4. Verify extension information:
```
gnome-extensions info cloud-flare-warp-toggle@macuseri686.me
```

5. Restart GNOME Shell:
```
killall -HUP gnome-shell
```
NOTE: If you are using Wayland, you need to log out and log back in.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

See [LICENSE](LICENSE) for more details.

## Credits

Created by @macuseri686
