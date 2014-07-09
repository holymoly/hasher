var fs = require('fs');
var crypto = require('crypto');

exports.recursiveSearchFiles = function(dir, cb) {
   walk(dir, function(err, res) {
      cb(err,res);
   });
};

//Recursiv through directory
var walk = function(dir, cb) {
  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return cb(err);
    var pending = list.length;
    if (!pending) return cb(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) cb(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) cb(null, results);
        }
      });
    });
  });
};

//hashing files and write to result.csv
exports.hashing = function(result,pos,cb) {
  fs.writeFile('results.csv', '', function(){});

  var hashFile = function(file,pos) {
    if(result.length !== pos){
      //console.log(file);
      fs.stat(file, function (err, stats) {
        if(file !== undefined){
          var fd = fs.createReadStream(file);
          var hash = crypto.createHash('md5');

          hash.setEncoding('hex');

          fd.on('end', function() {
            hash.end();
            var hashedhex = hash.read();                   
            //console.log(hashedhex + ' ' + file); // the desired sha1sum
            fs.appendFile('results.csv', hashedhex + ',' + file + '\n', function (err) {
            });
            hashFile(result[pos+1],pos+1);  
          });

          fd.on('error', function(err) {
            console.log(err);
          });
          // read all file and pipe it (write it) to the hash object
          fd.pipe(hash);
        }
      });
    }else{
      console.log('Finished with ' + pos + ' items.');
      cb();
    }
  };
  hashFile(result[0],0);
};

exports.extractDuplicates = function(hashedFiles,cb){
  fs.writeFile('duplicate.csv', '', function(){});
  var checkSingleFile = function(file,pos){
    //console.log(file);
    //extract hash
    if(hashedFiles.length-1 !== pos){
      var hash = file.split(',')[0];
      hashedFiles.forEach(function(fileToCompare){
        //console.log(fileToCompare);
        var hashTocompare = fileToCompare.split(',')[0];
        if(fileToCompare !== file){
          if (hashTocompare === hash){
            console.log('org: ' + file + '\n' + 'cop: ' + fileToCompare + '\n');
            fs.appendFile('duplicate.csv', 'org: ' + file + '\n' + 'cop: ' + fileToCompare + '\n\n', function (err) {
              
            });
            //remove Duplicate from searchlist
            hashedFiles.splice(hashedFiles.indexOf(fileToCompare),1);
          }
        }
      });
      checkSingleFile(hashedFiles[pos+1],pos+1);
    }
  };
  setTimeout(function() { 
    checkSingleFile(hashedFiles[0],0)
  } , 5000);
  
};

exports.fileToArray = function (file, cb){
  console.log('File to Array');
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) throw err;
      var array = data.split('\n')
      cb(err,array);
  });
};