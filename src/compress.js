
var dragArea = document.querySelector(".cdd"),
inputFile = document.querySelector("#files"),
fileCounter = document.querySelector(".file-counter");

dragArea.addEventListener("dragover", function( e ) {
   e.preventDefault();
   this.classList.add("ready");
} );

dragArea.addEventListener("dragleave", function( e ) {
   e.preventDefault();
   this.classList.remove("ready");
} );

dragArea.addEventListener("drop", function( e ) {
   e.preventDefault();
   
   var files = e.dataTransfer.files,
      len = files.length;

   inputFile.files = files;
   fileCounter.innerHTML = len + ( len === 1 ? " File" : " Files" );
} );

inputFile.addEventListener("change", function( e ) {
   var files = e.target.files,
      len = files.length;

   fileCounter.innerHTML = len + ( len === 1 ? " File" : " Files" );
} );


function errorOrSuccessHandling( msg ) {
   const error = document.querySelector(".errors"),
   errotText = error.querySelector("span");

   if ( typeof msg === "string" ) {
      error.style.display = "";
      errotText.innerHTML = msg;
      return error;
   }

   error.style.display = "none";
   return error;
}

// handling download options
function showDownloadOption( bool, zipname, size ) {
   var downloadOpt = document.querySelector(".download-zip");
   var zipName = downloadOpt.querySelector(".zipname");
   var filesize = downloadOpt.querySelector(".size");

   if ( typeof bool === "boolean" && bool ) {
      downloadOpt.style.display = "";
      document.forms[ 0 ].style.display = "none";
      zipName.innerHTML = zipname; // set zipname
      filesize.innerHTML = size; // set filesize
      return downloadOpt;
   }
   
   downloadOpt.style.display = "none";
   document.forms[ 0 ].style.display = "";
   return downloadOpt;
}

document.forms[ 0 ].addEventListener("submit", function( e ) {
   e.preventDefault();

   const error = document.querySelector(".errors");
   const formData = new FormData( this );


   var compressBtn = document.querySelector(".compress-button");
   compressBtn.innerHTML = "Compressing...";
   compressBtn.classList.add("progress");
   compressBtn.disabled = true;

   var xhr = new window.XMLHttpRequest();
   xhr.open("POST", "./api/compress.zip.php", true );
   xhr.onload = function() {
      if ( xhr.readyState === xhr.DONE && ( xhr.status >= 200 && xhr.status < 300 ) ) {

         try {
            this.jsonData = JSON.parse( this.response );
         } catch( e ) {
            errorOrSuccessHandling( "Parsererror: Faild creation zip soemthing went problem?" );
            return;
         }

         const jsonData = this.jsonData;

         setTimeout( function() {

            if ( jsonData["error"] ) {
               errorOrSuccessHandling( jsonData["error"] ).classList.add("show-danger");
               error.classList.remove("show-success");
            }
            else {
               errorOrSuccessHandling( jsonData["success"] ).classList.add("show-success");
               error.classList.remove("show-danger");

               showDownloadOption( true, jsonData["zipname"], jsonData["size"] );
            }

            compressBtn.innerHTML = "Compress zip";
            compressBtn.classList.remove("progress");
            compressBtn.disabled = false;
         }, 1000);         
      }
   }
   xhr.send( formData );
} );

// download zip file on click handler
document.querySelector(".download").addEventListener("click", function() {
   var zipname = document.querySelector(".zipname").textContent;

   // creating downlod link
   var link = document.createElement("a");
   link.href = "./downloads/" + zipname + ".zip";
   link.download = zipname;

   link.click();

   // let's start xhr
   var xhr = new window.XMLHttpRequest();
   xhr.open("GET", "./api/compress.zip.php?rmv=" + zipname, true);
   xhr.onload = function() {
      if ( xhr.readyState === xhr.DONE && ( xhr.status >= 200 && xhr.status < 300 ) ) {
         if ( this.response === "success" ) {
            document.forms[ 0 ].reset();
            showDownloadOption( false ); // hide downlod option
            fileCounter.innerHTML = ""; // reset file counter
         }
      }
   }
   xhr.send();
} );