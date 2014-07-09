var fs = require('fs');
var io = require('./source/io');
// the file you want to get the hash    

io.recursiveSearchFiles(process.argv[2],function(err,result){
  if(!err){   
    //start hashing
    io.hashing(result,0,function(){
      io.fileToArray ('results.csv', function (err, lines){
        console.log('Start');
        if (!err){
          io.extractDuplicates(lines);
        }else{
          return console.log (err);
        }
      });
    });
  }else{
    console.log(err.stack);
  }
});