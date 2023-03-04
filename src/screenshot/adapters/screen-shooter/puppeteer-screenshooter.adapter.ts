import puppeteer, { Browser } from 'puppeteer';
import { IScreenShooterAdapter } from './iscreenshooter.adapter';
import { ParamsTakeScreenShoot } from './params-take-screen-shoot';

let browser: Browser;

export class PuppeteerScreenShooterAdapter implements IScreenShooterAdapter {
  async takeScreenShot(
    url: string,
    params: ParamsTakeScreenShoot,
  ): Promise<string | Buffer> {
    if (!browser) {
      browser = await puppeteer.launch();
      browser.on('disconnected', async () => {
        browser = await puppeteer.launch();
      });
    }

    const page = await browser.newPage();

    await page.goto(url);

    if (params.width && params.height) {
      params.width = Number(params.width);
      params.height = Number(params.height);

      await page.setViewport({
        width: params.width,
        height: params.height,
      });
    }

    let screenShootBinary;
    if (params.element) {
      // @ts-ignore
      const element = await page.$(params.element);
      screenShootBinary = await element.screenshot({
        encoding: 'binary',
        type: params.format,
        quality: params.quality,
      });

      page.close();
      return screenShootBinary;
    }

    if (params.isFullPage) {
      screenShootBinary = await page.screenshot({
        type: params.format,
        encoding: 'binary',
        quality: params.quality,
        fullPage: true,
      });
    } else {
      screenShootBinary = await page.screenshot({
        type: params.format,
        encoding: 'binary',
        quality: params.quality,
      });
    }

    page.close();
    return screenShootBinary;
  }
}
