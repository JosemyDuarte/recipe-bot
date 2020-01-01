"use strict";

const getRecipe = async () => {
  try {
    const axios = require('axios').default;
    return await axios.get("http://www.recipepuppy.com/api/", {
      params: { i: "onions, garlic", q: "omelet", p: "2" }
    })
  } catch (error) {
    console.error(error)
  }
}
module.exports.hi = async function (event, context) {
  const recipeResponse = await getRecipe()
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World!', event: event, recipe: recipeResponse.data }),
  };
  return response
};


exports.find = async (event) => {
  const Telegraf = require('telegraf')
  const bot = new Telegraf(process.env["TELEGRAM_TOKEN"]);
  bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log('Response time: %sms', ms)
  })

  bot.command('recipe', async ({ reply }) => {
    getRecipe()
      .then(response => reply(JSON.stringify(response.data)))
      .catch(error => {
        console.log(error)
      })
  });

  bot.launch();
};

