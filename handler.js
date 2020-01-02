"use strict";

const getRecipe = async (ingredients) => {
  try {
    const axios = require('axios').default;
    const recipe = await axios.get("http://www.recipepuppy.com/api/", {
      params: { i: ingredients, p: "1" }
    });
    console.log(recipe.data);
    return recipe;
  } catch (error) {
    console.error(error)
  }
}


module.exports.hi = async function (event, context) {
  const recipeResponse = await getRecipe("eggs, cheese")
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World!', event: event, recipe: recipeResponse.data, }),
  };
  return response
};


exports.find = async (event) => {
  const Telegraf = require('telegraf');
  const bot = new Telegraf(process.env["TELEGRAM_TOKEN"]);
  const urlExists = require('url-exists');
  const commandArgsMiddleware = require('./commandArgs');
  bot.use(commandArgsMiddleware());

  bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log('Response time: %sms', ms)
  })

  bot.start((ctx) => ctx.reply('Hello'))

  bot.command('recipe', (ctx) => {
    getRecipe(ctx.state.command.args.join())
      .then(response => {
        const recipes = response.data.results ? response.data.results : [];
        if (recipes.length > 0) {
          recipes.slice(-5).forEach(recipe => {
            urlExists(recipe.href, function (err, exists) {
              if (exists) {
                ctx.reply(recipe.title.trim().replace(/[^a-zA-Z ]/g, "").concat(": ", recipe.href))
              }
              else {
                console.log("Ignoring:\n ".concat(JSON.stringify(recipe)));
              }
            })
          });
        } else {
          ctx.reply("No recipe found for ".concat(ctx.state.command.args.join()))
        }
      })
      .catch(error => {
        console.log(error)
      })
  });

  bot.launch();
};

