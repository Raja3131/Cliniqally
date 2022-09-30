#!/bin/sh
clear
#function defentions

cecho() {
    local code="\033["
    case "$1" in
    black | bk) color="${code}0;30m" ;;
    red | r) color="${code}1;31m" ;;
    green | g) color="${code}1;32m" ;;
    yellow | y) color="${code}1;33m" ;;
    blue | b) color="${code}1;34m" ;;
    purple | p) color="${code}1;35m" ;;
    cyan | c) color="${code}1;36m" ;;
    gray | gr) color="${code}0;37m" ;;
    *) local text="$1" ;;
    esac
    [ -z "$text" ] && local text="$color$2${code}0m"
    echo "$text"
}
createPr() {
    cecho p "creating pr for $1 to $2"
    gh pr create -H $1 -B $2 -t "$1 to $2" -b "$1 to $"
}

mergePr() {
    cecho p "merging pr"
    pr_data=$(gh pr list --author @me | awk '{print $1;}')
    cecho p $pr_data
    gh pr merge $pr_data -m
}

#all envs
main="main"
staging="staging"
qa="qa"
beta="beta"
dev="dev"

#function defentions end
stored_date=$(date)
cecho y "$stored_date"
cecho g "Script by @alokraj68"
cecho b "vaasits.com"
REQUIRED_PKG="gh"
PKG_OK=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG | grep "install ok installed")
cecho c "Checking for $REQUIRED_PKG: $PKG_OK"
if [ "" = "$PKG_OK" ]; then
    cecho r "No $REQUIRED_PKG. Setting up $REQUIRED_PKG."
    sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-key C99B11DEB97541F0
    sudo apt-add-repository https://cli.github.com/packages
    sudo apt update
    sudo apt install gh -y
fi

cecho g "Starting Github cli"

createPr $main $staging
mergePr
createPr $staging $qa
mergePr
createPr $qa $beta
mergePr
createPr $beta $dev
mergePr
