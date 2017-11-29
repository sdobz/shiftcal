# shiftcal

This is the source code for the Shift/Pedalpalooza Calendar.
===========================================================

The purpose of the Shift/Pedalpalooza Calendar is to empower citizens to create and view bike events and to spread bike fun. 

This repository has been sanitized of passwords from the copy running at http://shift2bikes.org/betacal , but if you'd like to see it in action that's where to check it out.

Basic Architecture
------------------

The front-end uses jQuery, Mustache templates, and Bootstrap.

The back-end uses Flourish php and MySQL.

License
-------

This repository is under MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

How to setup & run locally
--------------------------

Anyone who wants to run the site locally will need the following prerequisites:

- PHP version 5.6.x.
- enabled the apache module for PHP 
- mysql installed, running and accessible from your dev environment
- The 'mysql', 'pdo\_mysql', or 'mysqli' module enabled for PHP

To test your installation, you should be able to create a webpage (e.g. /Library/Webserver/Documents/test.php) with just the code:

```
<?php phpinfo(); ?>
```

and have the browser succesfully load http://localhost/test.php that shows the correct version of php (at the top of the output) and that the mysql.so extension is enabled (there is a section titled 'mysql')

Now that your environment is ready, see https://github.com/ShiftGithub/shiftcal/wiki/in-depth-setup-instructions for the rest of the installation instructions.

To do list
----------
You can see our plans for improvements [here](https://tree.taiga.io/project/shift2bikes-shift-calendar/)
 

How to make improvements to integration with Facebook  
-----------------------------------------------------

The Facebook app ID is 135930960098034. 

How to propose changes
----------------------

Please fork the master branch of the ShiftGithub/shiftcal code into a branch in your own account, commit your changes to that branch, make a pull request against the master branch of ShiftGithub/shiftcal, and we'll try to merge it!



