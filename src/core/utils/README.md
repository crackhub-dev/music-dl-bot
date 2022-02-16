you need a copy of zspotify in here. It's not included since this project is hosted on github.

important:
change line 37 - 39 in zspotify.py from:
```            
while len(user_name) == 0:
    user_name = input('Username: ')
password = getpass()
```
to:
```
while len(user_name) == 0:
    user_name = "<YOUR SPOTIFY EMAIL>"
password = "<YOUR SPOTIFY PASSWORD>"
```