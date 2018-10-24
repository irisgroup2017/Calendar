"# Calendar" 
test 1234fef

        .nav-search
         a(data-toggle="dropdown" href="#" class="dropdown-toggle" aria-expanded="false" id="username")
          span=parms.user
          ul.user-menu.dropdown-menu-right.dropdown-menu.dropdown-yellow.dropdown-caret.dropdown-close#ddlist
          li#ddlist
           a#ddlist
            i.ace-icon.fa.fa-user-circle-o
            =parms.user
          li#ddlist
           a#ddlist(href="/profile")
            i.ace-icon.fa.fa-address-book-o
            ="User Profile"
          .divider
           li#ddlist
            a#ddlist(href="/authorize/signout")
            i.ace-icon.fa.fa-power-off
            ="Logout"
       else
        li.selected
         a
          span='Home'
        .nav-search
         a(href="/login")
          span="Click here to Login"         
        //User menu