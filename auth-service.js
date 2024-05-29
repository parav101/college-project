// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
// connect to Your MongoDB Atlas Database
// mongoose.connect("mongodb+srv://parav101:parav101@cluster0.cdrpb.mongodb.net/one?retryWrites=true&w=majority"
//         // , { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
//     );

    var userSchema = new Schema({
        "userName": {
            "type":String,
            "unique": true
        },
        "password": String,
        "email": String,
        "loginHistory":[ { "dateTime": Date, "userAgent": String  } ],
       
      });

      
let User; // to be defined on new connection (see initialize)


  module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://parav101:parav111@cluster0.cdrpb.mongodb.net/one?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password != userData.password2){
            reject("Passwords do not match");

           
        }else{
            
            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB

                userData.password = hash; //trying save hash in userdata

            })
            .catch(err=>{
                console.log("There was an error encrypting the password" ); // Show any errors that occurred during the process
            });
            
            setTimeout(() => {  //bycrpt slow>>>>>>>>>>>
            

            let newUser = new User(userData); 
            newUser.save((err, data) => {
                if(err) {
                    if(err.code == 11000){
                        reject("User Name already taken");
                    }
                    else{
                        reject("There was an error creating the user: "+ err);
                    }
                } 
                else 
                {
                    resolve();
                    // process.exit();
                }
                // exit the program after saving
               
              });
            }, 2000);
        }
    });
};

module.exports.checkUser = function (userData){
    return new Promise(function (resolve, reject) {
        User.find({ 
             userName: userData.userName
          } 
        )
        .exec()
        .then((user) => { //sends an array btw
            if(user){
                // resolve();
                let result;
                bcrypt.compare(userData.password, user[0].password).then((match) => {
                    // result === true if it matches and result === false if it does not match
                    result = match;
                    console.log(result);
                 });
                 setTimeout(() => {  //bycrpt slow>>>>>>>>>>>
                if(!result){
                    reject("Incorrect Password for user: "+ userData.userName  );
                }
                else{
                    user[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent}) //complex}}}}}}}}}}}}}}}}}}}}
              
                    User.updateOne({userName :user[0].userName }
                        , { $set: { loginHistory : user[0].loginHistory } }
                    ).then(function(data){
                        resolve(user[0]); //complex}}}}}}}}}}
                    }).catch(function (error) {
                        reject("There was an error verifying the user: "+ error );
                    }); 
                }
            }, 2000);
            }
            else{
                reject("Unable to find user : "+ userData.userName  );
            }
    
        //   process.exit();
        })
        .catch((err) => {
         reject("Unable to find user: " +userData.userName + err);
        });
    });
};