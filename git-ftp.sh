
# install 
# sudo apt-get install git-ftp

# setup
git config git-ftp.user seidel
git config git-ftp.url sftp://aple.fernuni-hagen.de/home/moodle/mod/usenet
git config git-ftp.password <the password>
# git config git-ftp.syncroot /home/abb/Documents/www/moodle/mod/usenet
git config git-ftp.insecure 0

# update
# git-ftp push #--remote-root home/moodle/mod/usenet -vv --syncroot x.html

# git ftp init -u "seidel" --key "$HOME/.ssh/id_rsa" "sftp://aple.feruni-hagende/home/moodle/mod/usenet"
# git ftp init -u "seidel" --key "$HOME/.ssh/id_rsa" "sftp://aple.feruni-hagende/home/moodle/mod/usenet"