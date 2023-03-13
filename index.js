if(process.env.NODE_ENV !== "production"){
	require('dotenv').config();
}


const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./Schema/User')
const methodOverride = require('method-override'); 
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer  = require('multer');
const {storage, cloudinary} = require('./cloudinary');
const Image = require('./Schema/Images');
const paystack = require("paystack")(process.env.PAYSTACKSECRET);
const { deleteOne } = require('./Schema/User');
const { url } = require('inspector');
const upload = multer({ storage});
const dbUrl = process.env.DB_URL;
const PORT = 8000;
//mongodb://localhost:27017/users
//process.env.DB_URL

app.use(express.static(path.join(__dirname,'/public')));
app.use(session({
	secret: process.env.SESSIONSECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: new Date(Date.now() + 3600000) // session will expire in 1 hour
	  }
  }));
app.use(methodOverride("_method"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })) 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'/views'))


//mongoose.connect(dbUrl);
//mongoose.connect(dbUrl);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const requireLogin = (req, res, next) => {
	if(!req.session.user_id){
		return res.redirect("/");
	}
	next();
}


app.post("/straightdrawpay", (req, res) => {
    const { email, amount, network, phone_number } = req.body;
	let kobo_amount = amount * 100

	paystack.transaction.initialize({
        email: email,
        amount: kobo_amount,
        phone: phone_number,
        callback_url: "https://betsolution.net/straightdraw"
    }).then(function(body) {
        //extract the reference
        let reference = body.data.reference
        //create a session variable to store the reference
        req.session.reference = reference;
        //redirect the user to the paystack payment page
        res.redirect(body.data.authorization_url);
		return;
		
	}).catch(function(error) {
		res.redirect('/straightdrawpay');
	  });
});

app.post("/fiveoddspay", (req, res) => {
    const { email, amount, phone_number } = req.body;
	if(!email || !phone_number)
		res.redirect("/fiveoddspay");
	let kobo_amount = amount * 100

	paystack.transaction.initialize({
        email: email,
        amount: kobo_amount,
        phone: phone_number,
        callback_url: "https://betsolution.net/fiveodds"
    }).then(function(body) {
        //extract the reference
        let reference = body.data.reference
        //create a session variable to store the reference
        req.session.reference = reference;
        //redirect the user to the paystack payment page
        res.redirect(body.data.authorization_url);
		return;	
	}).catch(function(error) {
		res.redirect('/fiveoddspay');
	  });
});

app.post("/weekendpay", (req, res) => {
    const { email, amount, phone_number } = req.body;
	let kobo_amount = amount * 100

	paystack.transaction.initialize({
        email: email,
        amount: kobo_amount,
        phone: phone_number,
        callback_url: "https://betsolution.net/weekend"
    }).then(function(body) {
        //extract the reference
        let reference = body.data.reference
        //create a session variable to store the reference
        req.session.reference = reference;
        //redirect the user to the paystack payment page
        res.redirect(body.data.authorization_url);
		return;
		
}).catch(function(error) {
	res.redirect('/weekendpay');
  });
});

app.post("/nbapay", (req, res) => {
    const { email, amount, network, phone_number } = req.body;
	let kobo_amount = amount * 100

	paystack.transaction.initialize({
        email: email,
        amount: kobo_amount,
        phone: phone_number,
        callback_url: "https://betsolution.net/basketball"
    }).then(function(body) {
        //extract the reference
        let reference = body.data.reference
        //create a session variable to store the reference
        req.session.reference = reference;
        //redirect the user to the paystack payment page
        res.redirect(body.data.authorization_url);
		return;
	}).catch(function(error) {
		res.redirect('/nbapay');
	  });
});

app.post("/fixedgamepay", (req, res) => {
    const { email, amount, phone_number } = req.body;
	let kobo_amount = amount * 100

	paystack.transaction.initialize({
        email: email,
        amount: kobo_amount,
        phone: phone_number,
        callback_url: "https://betsolution.net/fixedgame"
    }).then(function(body) {
        //extract the reference
        let reference = body.data.reference
        //create a session variable to store the reference
        req.session.reference = reference;
        //redirect the user to the paystack payment page
        res.redirect(body.data.authorization_url);
		return;
	}).catch(function(error) {
		res.redirect('/fixedgamepay');
	  });
});



app.get('/home', requireLogin, async (req,res) => {
	res.render('home.ejs')
})

app.get('/fiveodds', async (req,res)=> {
	const user_id = req.session.user_id;
	let {reference} = req.query;

	if(user_id){	
		const image = await Image.find({type:"fiveodds"});
				const info = {
				user_id,
				image
					}
			res.render('fiveodds.ejs',{info})
			return;
	}

	if(!reference)
	{
		res.redirect('/fiveoddspay');
		return;
	}

	paystack.transaction.verify(reference, async function(error, body) {
        if (error) {
            res.redirect('/fiveoddspay');
        }
        if (body.data.status === "success" && req.session.reference === reference || user_id) {      
			const image = await Image.find({type:"fiveodds"});
			const info = {
				user_id,
				image
			}
			 res.render('fiveodds.ejs', {info});
			req.session.reference = null;
			return;
        } else {      
            res.redirect('/fiveoddspay');
        }
    });


	// const user_id = req.session.user_id;
})

app.get('/fixedgame',async (req,res)=> {
	const user_id = req.session.user_id;
	let {reference} = req.query;
	if(user_id){	
		const image = await Image.find({type:"fixedgame"});
				const info = {
				user_id,
				image
					}
			res.render('fixedgame.ejs',{info})
			return;
	}


	if(!reference)
	{
		res.redirect('/fixedgamepay');
		return;
	}

	paystack.transaction.verify(reference, async function(error, body) {
        if (error) {
            res.redirect('/fixedgamepay');
        }
        if (body.data.status === "success" && req.session.reference === reference || user_id) {      
			const image = await Image.find({type:"fixedgame"});
			const info = {
				user_id,
				image
			}
			res.render('fixedgame.ejs',{info})
			req.session.reference = null;
			return;
        } else {      
            res.redirect('/fixedgamepay');
        }
    });

})

app.get('/straightdraw',async (req,res)=> {
	const user_id = req.session.user_id;
	let {reference} = req.query;

	if(user_id){	
		const image = await Image.find({type:"straightdraw"});
				const info = {
				user_id,
				image
					}
			res.render('straightdraw.ejs',{info})
			return;
	}

	if(!reference)
	{
		res.redirect('/straightdrawpay');
		return;
	}
	
	paystack.transaction.verify(reference, async function(error, body) {
        if (error) {
            res.redirect('/straightdrawpay');
        }
        if (body.data.status === "success" && req.session.reference === reference || user_id) {      
            const image = await Image.find({type:"straightdraw"});
				const info = {
				user_id,
				image
					}
			res.render('straightdraw.ejs',{info})
			req.session.reference = null;
			return;
        } else {         
            res.redirect('/straightdrawpay');
        }
    });

})

app.get('/basketball',async (req,res)=> {
	const user_id = req.session.user_id;
	let {reference} = req.query;

	if(user_id){	
		const image = await Image.find({type:"basketball"});
				const info = {
				user_id,
				image
					}
			res.render('basketball.ejs',{info})
			return;
	}
	if(!reference)
	{
		res.redirect('/nbapay');
		return;
	}

	paystack.transaction.verify(reference, async function(error, body) {
        if (error) {
            res.redirect('/nbapay');
        }
        if (body.data.status === "success" && req.session.reference === reference || user_id) {      
            const image = await Image.find({type:"basketball"});
			const info = {
				user_id,
				image
			}
			res.render('basketball.ejs',{info})
			req.session.reference = null;
			return;
        } else {    
            res.redirect('/nbapay');
        }
    });

})

app.get('/weekend',async (req,res)=> {
	const user_id = req.session.user_id;
	let {reference} = req.query;
	if(user_id){	
		const image = await Image.find({type:"weekend"});
				const info = {
				user_id,
				image
					}
			res.render('weekend.ejs',{info})
			return;
	}

	if(!reference)
	{
		res.redirect('/weekendpay');
		return;
	}
	

	paystack.transaction.verify(reference, async function(error, body) {
        if (error) {

            res.redirect('/weekendpay');
        }
        if (body.data.status === "success" && req.session.reference === reference || user_id) {      
            const image = await Image.find({type:"weekend"});
			const info = {
					user_id,
					image
				}
	       res.render('weekend.ejs',{info})
			req.session.reference = null;
			return;
        } else {   
     
            res.redirect('/weekendpay');
        }
    });
	
})

function errorHandler(err, req, res, next) {
	if (err instanceof multer.MulterError) {
	  // Multer error occurred
	  res.status(500).json({ error: err.message });
	} else {
	  // Some other error occurred
	  console.log(err)
	  res.status(500).json({ error: err });
	}
  }


app.post("/fiveodds", upload.array('file'), async(req,res) => {
	const newImage = new Image();
	newImage.type = "fiveodds"
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/fiveodds')
})

app.post("/fixedgame", upload.array('file'), async(req,res) => {
	const newImage = new Image();
	newImage.type = "fixedgame"
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/fixedgame')
})

app.post("/straightdraw", upload.array('file'), async(req,res) => {
	const newImage = new Image();
	newImage.type = "straightdraw"
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/straightdraw')
})

app.post("/basketball", upload.array('file'), async(req,res) => {
	const newImage = new Image();
	newImage.type = "basketball"
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/basketball')
})

app.post("/weekendgames", upload.array('file'), async(req,res) => {
	const newImage = new Image();
	newImage.type = "weekend"
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/weekend')
})

app.post('/delete/:type', async (req, res) => {
	console.log(req.body)
	const {type} = req.params
	const {damn, last} = req.params;
	await cloudinary.uploader.destroy(`${Object.keys(req.body)}`)
	console.log(`${damn}/${last}`)
	const del =  await Image.deleteOne({url: Object.keys(req.body)})
	res.redirect(`/${type}`)
})


app.post('/upload', upload.array('file'), async (req, res) => {
	const newImage = new Image();
	newImage.image = req.files.map(file => ({
		url: file.path,
		filename: file.filename
	}))
	if(newImage.image.length === 0)
		return res.redirect('/home')
	await newImage.save();
	res.redirect('/home')
})

app.post('/signup', async (req, res) => { 
	const {username, pass} = req.body;
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(pass, salt)
	const user = new User({
		username,
		password:hash
	})
	await user.save();
	req.session.user_id = user._id;
	res.redirect('/home')

})

app.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect("/login");
})

app.post('/login', async (req, res) => {
	const {username, pass} = req.body;
	const user = await User.findOne({username});
	if(user === null){
		return res.redirect("/login")
	}
	const validPassword = await bcrypt.compare(pass ,user.password);
	if(validPassword){
		req.session.user_id = user._id;
		res.redirect('/home');
	}else{
		res.redirect('/')
	}
})


app.get('/login', (req, res) => {
	res.render('index.ejs')
})


app.get('/', (req, res) => {
	res.render('subscribe.ejs')
})

app.get("/fixedgamepay", (req, res) => {
    res.render('payment/fixedgamepay.ejs');
});

app.get("/nbapay", (req, res) => {
    res.render('payment/nbapay.ejs');
});

app.get("/fiveoddspay", (req, res) => {
    res.render('payment/fiveoddspay.ejs');
});

app.get("/straightdrawpay", (req, res) => {
    res.render('payment/straighdrawpay.ejs');
});

app.get("/weekendpay", (req, res) => {
    res.render('payment/weekendpay.ejs');
});

app.use(errorHandler);
// app.listen(8000, ()=> {
// console.log("LISTENING ON PORT 3008")
// })
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})



app.get('*', (req, res)=> {
res.send("I DONT KNOW THIS PATH")
})
