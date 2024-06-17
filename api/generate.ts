import { createCanvas, loadImage } from 'canvas';
import GIFEncoder from 'gifencoder';

export class Aetolia1Service {
  private characterPosition = { x: 3, y: 3 };
  private mapImages = [
    './public/map/grass_movement_frame_1.png',
    './public/map/grass_movement_frame_2.png',
    './public/map/grass_movement_frame_3.png',
    './public/map/grass_movement_frame_4.png',
  ];
  private characterImages: string[] = [
    './public/map/nomad1.png',
    './public/map/nomad2.png',
    './public/map/nomad3.png',
    './public/map/nomad4.png',
  ];
  private updateCharacterPosition(direction: string) {
    switch (direction) {
      case 'up':
        this.characterPosition.y -= 1;
        break;
      case 'down':
        this.characterPosition.y += 1;
        break;
      case 'left':
        this.characterPosition.x -= 1;
        break;
      case 'right':
        this.characterPosition.x += 1;
        break;
      default:
        break;
    }
  }

  async generateGif(direction?: string){
    // 更新人物位置
    if (direction) {
      this.updateCharacterPosition(direction);
    }

    const mapTileSize = 30; // 地图图片的尺寸
    const gridRows = 9; // 行数
    const gridCols = 9; // 列数
    const width = mapTileSize * gridCols; // 画布的宽度
    const height = mapTileSize * gridRows; // 画布的高度
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const encoder = new GIFEncoder(width, height);

    // const stream = createWriteStream('./temp.gif');

    // encoder.createReadStream();
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(200); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // 并行加载所有地图帧和人物帧
    const [mapImages, characterImages] = await Promise.all([
      Promise.all(this.mapImages.map((src) => loadImage(src))),
      Promise.all(this.characterImages.map((src) => loadImage(src))),
    ]);

    // 先渲染所有地图帧
    const mapFrames = mapImages.map((mapImage) => {
      ctx.clearRect(0, 0, width, height); // 清除画布

      // 绘制五排五列的地图
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const offsetX = col - Math.floor(gridCols / 2);
          const offsetY = row - Math.floor(gridRows / 2);

          ctx.drawImage(
            mapImage,
            col * mapTileSize,
            row * mapTileSize,
            mapTileSize,
            mapTileSize,
          );

          // 在每个地块中间绘制行列
          const tileLabel = `${this.characterPosition.y + offsetY},${this.characterPosition.x + offsetX}`;
          ctx.font = '10px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            tileLabel,
            col * mapTileSize + mapTileSize / 2,
            row * mapTileSize + mapTileSize / 2,
          );
        }
      }

      // 返回当前地图帧
      return canvas.toBuffer();
    });

    // 处理人物帧
    const characterFrames = characterImages.map((characterImage) => {
      ctx.clearRect(0, 0, width, height); // 清除画布
      ctx.drawImage(
        characterImage,
        Math.floor(gridCols / 2) * mapTileSize,
        Math.floor(gridRows / 2) * mapTileSize,
        mapTileSize,
        mapTileSize,
      );

      // 返回当前人物帧
      return canvas.toBuffer();
    });

    // 合并地图和人物帧
    const totalFrames = Math.max(mapFrames.length, characterFrames.length);
    for (let i = 0; i < totalFrames; i++) {
      const mapFrame = mapFrames[i % mapFrames.length];
      const characterFrame = characterFrames[i % characterFrames.length];

      ctx.clearRect(0, 0, width, height); // 清除画布
      ctx.drawImage(await loadImage(mapFrame), 0, 0); // 绘制地图帧
      ctx.drawImage(await loadImage(characterFrame), 0, 0); // 绘制人物帧

      encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
    }

    encoder.finish();

    const buffer = encoder.out.getData()
    return buffer
  }
}
