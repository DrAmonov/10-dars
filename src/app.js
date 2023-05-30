require('dotenv/config');
const { Bot, session } = require('grammy');
const { Router } = require('@grammyjs/router');

const TOKEN = process.env.TOKEN;
const bot = new Bot(TOKEN);

bot.use(session());

const router = new Router((ctx) => ctx.session.step);

// Array to store user data
const usersData = [];

bot.command('start', async (ctx) => {
	ctx.session = {}; // Reset session data
	ctx.session.step = 'step1';
	await ctx.reply('Please enter your username:');
});

router.route('step1', async (ctx) => {
	if (ctx.session.step === 'step1') {
		ctx.session.username = ctx.message.text;
		ctx.session.step = 'step2';
		await ctx.reply('Please enter your last name:');
	}
});

router.route('step2', async (ctx) => {
	if (ctx.session.step === 'step2') {
		ctx.session.lastName = ctx.message.text;
		ctx.session.step = 'step3';
		await ctx.reply('Please enter your age:');
	}
});

router.route('step3', async (ctx) => {
	if (ctx.session.step === 'step3') {
		ctx.session.age = ctx.message.text;
		ctx.session.step = 'step4';
		await ctx.reply('Please send a picture:');
	}
});

router.route('step4', async (ctx) => {
	if (ctx.session.step === 'step4') {
		if (ctx.message.photo && ctx.message.photo.length > 0) {
			ctx.session.photo = ctx.message.photo.pop();
			ctx.session.step = 'step5';
			await ctx.reply('Please share your location:');
		} else {
			await ctx.reply('Please send a picture. Try again:');
		}
	}
});

router.route('step5', async (ctx) => {
	if (ctx.session.step === 'step5') {
		if (ctx.message.location) {
			ctx.session.location = ctx.message.location;
			ctx.session.step = 'completed';

			const { photo, username, lastName, age, location } = ctx.session;

			// Save user data
			const userData = {
				username,
				lastName,
				age,
				location,
				photo: photo.file_id,
			};
			usersData.push(userData);

			// Reset session data
			ctx.session = {};

			await ctx.replyWithPhoto(photo.file_id, {
				caption: formatUserData(userData),
			});
		} else {
			await ctx.reply('Please share your location. Try again:');
		}
	}
});

bot.on('message', router);

bot.catch((error) => {
	console.log(error);
});

bot.start();

function formatUserData(userData) {
	return `Username: ${userData.username}\nLast Name: ${userData.lastName}\nAge: ${userData.age}\nLocation: ${userData.location}`;
}
