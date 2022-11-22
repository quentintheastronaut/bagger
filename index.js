const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const app = express();
const port = 2604;
const mysql = require("mysql");

const dbConfig = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "quan0402",
  database: "happy-meal-local",
});

function recipeConfig(slug) {
  return {
    method: "get",
    url: `https://unimeal.com/_next/data/AwBRAXxnPmDKVuegv7ach/en/cooking/${slug}.json?slug=${slug}`,
    headers: {
      Accept: "*/*",
      Pragma: "no-cache",
      Cookie:
        "aplp=; bid=; expGrp_ftm=; expGrp_start=; expName_ftm=; expName_start=; ftm=; gglp=; npmt=; plans_group=; pm=; pp=; pricePackageId=; ptm=; st=; target=; tmr=; utm_campaign=; utm_medium=; utm_referrer=; utm_source=; utm_term=; variation=; vmcid=; _ga_QRJYMERFM5=GS1.1.1667411114.1.1.1667411171.0.0.0; countryCode=VN; _fbp=fb.1.1667411114683.1732719975; amp_0a212c=0THryEgOdtLC-2uTou_eVv...1ggsn524v.1ggsn5256.2.2.4; amp_aa8fa4=SFPlxSujo7PvJ2zu8IF8ll...1ggsn525b.1ggsn525b.0.0.0; amp_cb149c=ggYZlEzewfcDjmxVoA20SE...1ggsn5259.1ggsn5259.0.0.0; _ga=GA1.2.70059673.1667411115; _gat_UA-169904587-1=1; _gcl_au=1.1.1839200700.1667411114; _gid=GA1.2.1879510779.1667411115",
      "Cache-Control": "no-cache",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      Host: "unimeal.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
      Referer:
        "https://unimeal.com/cooking/chicken-and-rice-casserole-recipe-6",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "x-nextjs-data": "1",
    },
  };
}

app.get("/", async (req, res) => {
  const data = new FormData();

  let slugList = [];

  dbConfig.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!!");
  });

  const config = {
    method: "get",
    url: `https://admin.unimealplan.com/api/v4.0/cooking/recipes?limit=100&page=2`,
    headers: {
      Accept: "application/json, text/plain, */*",
      Origin: "https://unimeal.com",
      Pragma: "no-cache",
      Connection: "keep-alive",
      "Accept-Language": "en",
      Referer: "https://unimeal.com/",
      Host: "admin.unimealplan.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
      Authorization:
        "Bearer V4UsILt9kW0F6kxcFzfkxmfRea1nSe3S6qbJvdDdylMAe0CYy1",
      "Cache-Control": "no-cache",
      "Accept-Encoding": "gzip, deflate, br",
      ...data.getHeaders(),
    },
    data: data,
  };

  await axios(config)
    .then(function (response) {
      response.data.recipes.forEach((element, index) => {
        slugList.push(element.slug);
      });
    })
    .catch(function (error) {
      console.log(error);
    });

  console.log(slugList);

  slugList.forEach(async (element, index) => {
    const recipeConf = recipeConfig(element);

    await axios(recipeConf)
      .then(async function (response) {
        const recipe = response.data.pageProps;

        const name = recipe.name;
        const carbohydrates = recipe.carbs.value;
        const calories = recipe.calories.value;
        const fat = recipe.fats.value;
        const protein = recipe.proteins.value;
        const imageUrl = recipe.image;

        var sql = `INSERT INTO dish (name, carbohydrates, fat, protein, calories, imageUrl) VALUES ("${name}", ${carbohydrates}, ${fat}, ${protein}, ${calories}, "${imageUrl}");`;

        await dbConfig.query(sql, function (err, results) {
          if (err) throw err;
          console.log(`Insert ${element.name} succesfullt - ${index}/100 \n`);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  //  var sql = `INSERT INTO dish (name, carbohydrates, fat, protein, calories, imageUrl) VALUES (${element.name}, ${element.}, ${}, ${}, ${}, ${});`;

  //  con.query(sql, function (err, results) {
  //     if (err) throw err;
  //     console.log(`Insert ${element.name} succesfullt - ${index}/100 \n`);
  //   });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
