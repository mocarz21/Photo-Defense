const Photo = require('../models/photo.model');


/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileWalidation =fileName.split('.').slice(-1)[0]

    const authorPattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/, 'g');
    const emailPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'g');
    const titlePattern = new RegExp(/(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/, 'g');
    
    const titleMatched = title.match(titlePattern).join('');
    const authorMached = author.match(authorPattern).join('');
    const emailMached  = email.match(emailPattern).join('');



    //if(titleMatched.length < title.length){

      if(title && author && email && file && author.length < 20 && title.length < 20 && fileWalidation ==="jpg" || fileWalidation ==="png") { // if fields are not empty...

        
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);

      } else {
        throw new Error('Wrong input!');
      }
   // }else throw new Error('Wrong input!');

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const userIP = requestIp.getClientIp(req);
    const findUser = await Vote.findOne({ user: userIP });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    if (findUser) {
      // if user already voted...
      if (findUser.votes.includes(photoToUpdate._id)) {
        res.status(500).json(err);
      } else {
        // if user has not voted yet...
        photoToUpdate.votes += 1;
        await photoToUpdate.save();
        findUser.votes.push(photoToUpdate._id);
        await findUser.save();
        res.json(photoToUpdate);
      }
    } else {
      // if user has not voted yet...
      const newVoter = new Voter({ user: userIP, votes: [photoToUpdate._id] });
      await newVoter.save();
      photoToUpdate.votes += 1;
      await photoToUpdate.save();
      res.json(photoToUpdate);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
