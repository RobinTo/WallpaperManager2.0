# WallpaperManager2.0
Wallpaper downloader and manager using node-webkit.

A simple node-webkit app which scrapes subreddits for wallpapers in set dimensions, downloads them, and lets you set them as wallpaper directly from the application.

<img src="http://i.imgur.com/L37pyJ7.png" width="50%"/>

Gui and scraping is done with node-webkit. Currently the setting of wallpaper only works on windows, and is done using python and as such requires python installed and configured as a path variable. It calls the python script via the command line.

By default downloads 1920x1080 wallpapers from the subreddits /r/wallpaper and /r/wallpapers. Skips wallpapers marked as nsfw.

Settings can be edited in<br />
%appdata%/roaming/WallpaperManager/settings.txt<br />
and a few of the settings can be changed from the settings menu in the application.

Can be set to download all images from subreddits, not just wallpapers.

Planned features:
* Better settings page, where you can actually add resolutions and subreddits.
* Multi-screen wallpaper selection.
* Categorization and sorting of wallpapers.
* Better webscraping. Currently only downloads direct links to images on imgur, not albums or images hosted on other sites.
