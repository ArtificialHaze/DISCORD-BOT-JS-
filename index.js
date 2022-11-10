const Discord = require("discord.js");
const fetch = require("node-fetch");
const Database = require("@replit/database");
const express = require("express");

const client = new Discord.Client();

const words = ["hi", "go", "happy", "give"];

const db = new Database();

const server = express();

server.all("/", (req, res) => {
  res.send("Bot is running");
});

function stayAwake() {
  server.listen(5500, () => {
    console.log("Server is ready.");
  });
}

const starterMessages = [
  "Cheering you my lovely sir.",
  "Hang in there and be couregess",
  "You are great!",
];

db.get("messages").then((messages) => {
  if (!messages || messages.length < 1) {
    db.set("messages", starterMessages);
  }
});

db.get("responding").then((value) => {
  if (value === null) {
    db.set("responding", true);
  }
});

function updateMessages(updatedMessages) {
  db.get("messages").then((messages) => {
    messages.push([updatedMessages]);
    db.set("messages", messages);
  });
}

function deleteMessages(index) {
  db.get("messages").then((messages) => {
    if (messages.length > index) {
      messages.splice(index, 1);
      db.set("messages", messages);
    }
  });
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then((res) => res.json())
    .then((data) => {
      return data[0]["q"] + " -" + data[0]["a"];
    });
}

client.on("ready", () => {});

client.on("message", (message) => {
  if (message.author.bot) return;

  if (message.content === "$hi") {
    getQuote().then((quote) => message.channel.send(quote));
  }

  db.get("responding").then((responding) => {
    if (responding && words.some((word) => message.content.includes(word))) {
      db.get("messages").then((messages) => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        message.reply(msg);
      });
    }
  });

  if (message.content.startsWith("$new")) {
    const updatedMessage = message.content.split("$new ")[1];
    updateMessages(updatedMessage);
    message.channel.send("New message added.");
  }

  if (message.content.startsWith("$del")) {
    const index = parseInt(message.content.split("$del ")[1]);
    deleteMessages(index);
    message.channel.send("Message deleted.");
  }

  if (message.content.startsWith("$list")) {
    db.get("messages").then((messages) => {
      message.channel.send(messages);
    });
  }

  if (message.content.startsWith("$responding")) {
    value = message.split("$responding ")[1];
    if (value.toLowerCase() == "true") {
      db.set("responding", true);
      message.channel.send("Responding is on");
    } else {
      db.set("responding", false);
      message.channel.send("Responding is off");
    }
  }
});

stayAwake();
client.login(process.env.TOKEN);
