# File System Sweeper
File System Sweeper allows cleaning up your file system based on pre-defined rules.

## Context
The desktop for all my devices is cluttered with screenshots, pdf, and other downloads. I download stuff and use it immediately without putting any effort into organizing them. This creates a lot of clutter. The office MacBook has ~4k screenshots on the desktop that are hidden because of the stack feature. Hopefully, this file system sweeper will move my files from the default download location to the correct folders.

## Configuration Parameters
- **Source** - Regex Identifying Source Files
- **Destination** - Folder to move/copy files that match regex
- **Cron** - Cron Expression to describe sweep frequency
- **Move** - Flag if files should be moved or copied

## Sample Configuration
```
[
    {
        "source": "~/Desktop/Screenshot 2023-09*.png",
        "destination": "~/Desktop/Screenshots/2023-09",
        "cron": "* * * * *",
        "move": false
    }
]
```

## Screenshot
<img width="1792" alt="sweeper-screenshot" src="https://github.com/prophet1906/fs-sweeper/assets/32415088/8ea815a1-e076-4ed7-b10f-74a00f71668d">
