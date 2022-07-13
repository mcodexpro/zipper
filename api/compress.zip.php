<?php
   if ( isset( $_POST["zipname"] ) && isset( $_FILES["files"] ) ) {
      
      // form validation in php
      $zipname = $_POST["zipname"];
      $files = $_FILES["files"];

      function isEmptyFile( $files ) {
         foreach( $files["name"] as $index=> $value ) {
            if ( !empty( $value ) ) return false;
         }
         return true;
      }

      $rzipname = "/^[a-zA-Z0-9\-\._ ]+$/";

      if ( empty( $zipname ) ) {
         die( json_encode( array("error"=>"zipname is required. please enter your zipname?") ) );
      }
      else if ( !preg_match( $rzipname, $zipname ) ) {
         die( json_encode( array("error"=>"Invalid zipname you cannot use '".$zipname."' zipname") ) );
      }

      if ( isEmptyFile( $files ) ) {
         die( json_encode( array("error"=>"We cannot create zip. plase select your file") ) );
      }

      $dir = "../downloads/";
      $zipSetup = $dir.$zipname.".zip";
      $status = "error";

      $zip = new ZipArchive();
      $zip->open( $zipSetup, ZipArchive::CREATE);
      foreach( $files["name"] as $index=>$value ) {
         // get file tmp_name
         $tmp_name = $files["tmp_name"][ $index ];

         if ( move_uploaded_file( $tmp_name, "../uploads/".$value ) ) {
            $zip->addFile( "../uploads/".$value );
            $status = "success";
         }
      }
      $zip->close();

      // now delete/remove before uploaded files
      foreach( $files["name"] as $key=>$filename ) {
         if ( file_exists( "../uploads/".$filename ) ) {
            unlink( "../uploads/".$filename );
         }
      }

      function sizeFormat( $size ) {
         $sizes = array( " Bytes", " KB", " MB", " GB" );
         if ( $size === 0 ) {
            return ('n/a');
         } else {
            return ( round( $size / pow( 1024, ( $i = floor( log( $size, 1024 ) ) ) ), 2 ) . $sizes[ $i ] );
         }
      }

      $formatSize = sizeFormat( filesize( $zipSetup ) );
      die( json_encode( array($status=>"'".$zipname."' converted zip successfully!", "zipname"=>$zipname, "size"=>$formatSize) ) );
   }

   if ( isset( $_GET["rmv"] ) ) {
      $rmv_file_setup = "../downloads/".$_GET["rmv"].".zip";
      if ( file_exists( $rmv_file_setup ) ) {
         unlink( $rmv_file_setup );
      }
      die("success"); // die success status
   }
?>