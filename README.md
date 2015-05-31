This library aims to provide a nice method to insert multiple data in web pages using HTML5, CSS3 and Javascript. It also provide a set of beautiful themes, but you have to permission to change them a nd create new one.

The project architectire is very simple:
  a div in your html file that define the Wrapper (area that contains all the input fields), and javascript line to init the wrapper and the many listener on it. All the complexity is hidden in the *.js and *.css files.
  
External requirement:
  0. Bootstrap
  1. JQuery
  
How it work:
  0. Import the *.js and .css and the pictures files
    <script type="text/javascript" src="js/DinamicInputFields.js" /></script>
    <link rel="stylesheet" type="text/css" href="css/DinamicInputFields.css" />
  1. Create the div
    <div id="myWrapper" class="multiDinamicInputFields"></div>
  2. Initialitazion:
    newMultiDinamicInputFields("#myWrapper"); or newMultiDinamicInputFields("#myWrapper",{});
    The first parament is the id of the wrapper. Remember the # char. Class are not supported. Then we have the optional field to specify some option through JSON syntax. Details are explained later.
  3. Congratulation! Now your wrapper can work!
