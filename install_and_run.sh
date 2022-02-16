echo "WARNING: This script will overwrite your current nodeJS version. Do you want to automatically install all requirements? (y/n)"
read answer
if answer == "y"
then
    echo "Beginning installation..."
    sudo apt install -y curl
    echo "Installed: cURL"
    sudo apt install -y python3-pip
    echo "Installed: pip"
    sudo apt install -y ffmpeg
    echo "Installed: ffmpeg"
    sudo apt install p7zip-full
    echo "Installed: 7-Zip"
    curl https://rclone.org/install.sh | sudo bash
    echo "Installed: rclone"
    wget https://github.com/yt-dlp/yt-dlp/releases/download/2022.02.04/yt-dlp && chmod +x yt-dlp && sudo mv yt-dlp /usr/local/bin/yt-dlp
    echo "Installed: yt-dlp"
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
    source ~/.profile
    nvm install 16.13.1 && nvm use 16.13.1
    echo "Installed: nodeJS v16.13.1"
    pip3 install streamrip
    echo "Installed: streamrip"
    echo "Opening streamrip config in default editor, add your accounts and edit your settings!"
    rip config --open
    echo "Running npm install"
    npm install
    echo "Running pip3 install"
    pip3 install -r zspotify-reqs.txt
    echo "Do you want to run the bot now? (y/n)"
    read answer
    if answer == "y"
    then
        echo "Do you want to run the bot in dev mode or production mode ?(d/p)"
        read answer
        if answer == "d"
        then
            echo "Running in dev mode (refreshes on save)"
            npm run dev
        else
            echo "Running in production mode"
            npm run start
        fi
    fi
else
    echo "Exiting..."
fi
