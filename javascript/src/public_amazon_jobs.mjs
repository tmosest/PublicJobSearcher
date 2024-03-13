import puppeteer from 'puppeteer';
import 'log-timestamp';
import fs from 'fs';

import { amazonPrompts } from './prompts/amazon_prompts.mjs';
import { createUrlFromPrompt } from './constants/amazon_url_constants.mjs';

const screenshotUrl = new URL('../screenshots', import.meta.url);

const resultsFolder = new URL('../results', import.meta.url);
const resultsFile = (resultsFolder + `/amazon-job-search-results-${Date.now()}.txt`).replace('file://', '');

console.log(resultsFile);

(async () => {
    console.log("Starting Amazon Job Finder");
    console.log(amazonPrompts);
    
    let amazonJobsUrl = createUrlFromPrompt(amazonPrompts);
    console.log(amazonJobsUrl);

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});

    // Navigate the page to a URL
    await page.goto(amazonJobsUrl);
    await delay(1000);

    // Click cookie button or we get no results.
    const cookieBtn = await page.waitForSelector('#btn-accept-cookies');
    await cookieBtn.click();
    await cookieBtn.dispose();

    // Get Number of Pages
    const pageCountElement = await page.$('[aria-label="Page selection"] >>> ul > li:last-child');
    const numberOfPages = await page.evaluate((el) => el.textContent, pageCountElement).then(val => val.trim());
    // pageCountElements.dispose();
    console.log(`Number of Pages: ${numberOfPages}`);

    let jobCount = 0;

    for (let i = 1; i <= numberOfPages; i++) {
        
        const cards = await page.$$('#search > div > div:last-child > ul > li');
        console.log(`Number of Cards: ${cards.length}`);

        for (let j = 0; j < cards.length; j++) {
            
            await page.bringToFront();
            const jobCountStr = `Job #: ${jobCount} \n`;
            console.log(jobCountStr);

            const cardLinkTag = await page.waitForSelector(`#search > div > div:last-child > ul > li:nth-child(${j + 1}) >>> a`);
            const link = await page.evaluate((el) => el.href, cardLinkTag);
            console.log(link);

            cardLinkTag.click();

            //get list of open tabs (does not include new tab)
            const pages = await browser.pages();

            //prints 2 although there are 3 tabs
            console.log(`Number of tabs ${pages.length}`);
            
            // get the new page
            const page2 = pages[pages.length - 1];
            await page2.bringToFront();
            await delay(2000);
            try {
                fs.appendFileSync(resultsFile, jobCountStr);
                const jobDetailUrl = await page2.evaluate(() => window.location.href);
                console.log(`New tab url is ${jobDetailUrl}`);
                fs.appendFileSync(resultsFile, `Job URL: ${jobDetailUrl}\n`);

                const jobTitle = await page2.$eval('h1', e => e.innerText);
                // console.log(`Job Title ${jobTitle}`);
                fs.appendFileSync(resultsFile, `Job Title: ${jobTitle}\n`);

                const jobContent = await page2.$eval('h2', el => el.parentElement.innerText);
                // console.log(`Job Content is ${jobContent}`);
                fs.appendFileSync(resultsFile, `Job Content: ${jobContent} \n\n`);
            } catch (error) {
                console.error(error);
            }
            await delay(2000);
            // await page2.close();
            jobCount++;
        }

        // Pass max jobs
        if (jobCount >= amazonPrompts['jobCount']) {
            break;
        }

        const pages = await browser.pages();
        console.log('cleaning up');
        for (let i = 2; i < pages.length; i++) {
            await pages[i].close();
            await delay(1000);
        }

        await page.bringToFront();
        const nextPageBtn = await page.waitForSelector('[aria-label="Next page"]');
        await nextPageBtn.click();
        await nextPageBtn.dispose();
    }

    // await browser.close();
    console.log("Finishing Amazon Job Finder");
})();

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
