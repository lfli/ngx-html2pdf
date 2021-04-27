import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface IncompletePage {
  page: HTMLCanvasElement,
  ctx: any,
  top: number
}

type Size = 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5'

@Injectable({
  providedIn: 'root'
})
export class NgxHtml2pdfService {

  private paperMap: { [key: string]: { width: number, height: number } } = {
    a0: {
      width: 841,
      height: 1189
    },
    a1: {
      width: 594,
      height: 841
    },
    a2: {
      width: 420,
      height: 594
    },
    a3: {
      width: 297,
      height: 420
    },
    a4: {
      width: 210,
      height: 297
    },
    a5: {
      width: 148,
      height: 210
    },
  }

  private singleMaxHeight = 15000;

  html2pdf(id: string, name: string, size: Size = 'a4') {
    return new Promise<void>((resolve, reject) => {
      const tempDiv = document.createElement('div');
      tempDiv.setAttribute('id', 'html2canvas');
      document.body.appendChild(tempDiv);

      setTimeout(() => {
        const indexTemp = document.getElementById('html2canvas');
        if (!indexTemp) {
          return;
        }

        const el = document.getElementById(id);
        if (!el) {
          return;
        }

        indexTemp.appendChild(el.cloneNode(true));

        const ele: any = indexTemp.firstChild;

        if (ele.clientHeight > this.singleMaxHeight) {

          this.bigPdfDown(ele, name, tempDiv, size).then(_ => {
            resolve();
          }).catch(error => {
            reject(error);
          })

        } else {

          const option = { allowTaint: true, useCORS: true };
          html2canvas(ele, option).then((canvas) => {
            let pdf: any = new jsPDF('p', 'mm', size) //纵向，单位mm
            let ctx: any = canvas.getContext('2d'); //预设2维画布
            const aw: number = this.paperMap[size].width - 20;  //设置显示内容的大小
            const ah: number = this.paperMap[size].height - 20;
            let imgHeight: number = Math.floor(ah * canvas.width / aw); //按显示比例换算一页图像的像素高度
            let renderedHeight: number = 0;

            while (renderedHeight < canvas.height) {//判断页面有内容时
              let page: any = document.createElement('canvas'); //创建画布
              page.width = canvas.width; //设置画布宽高等于内容宽高
              page.height = Math.min(imgHeight, canvas.height - renderedHeight); //画布的高等于内容的最小的高度（不足一页）
              //用getImageData裁剪指定区域，并绘制到前面创建的canvas对象中
              let a: any = page.getContext('2d');
              a.putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0);
              pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, aw, Math.min(ah, aw * page.height / page.width)); //添加图片到页面，保留10mm边距

              renderedHeight += imgHeight;
              if (renderedHeight < canvas.height) {
                pdf.addPage();
              }
            }
            pdf.save(name + '.pdf')
            tempDiv.remove();
            resolve();
          }).catch((error) => {
            console.error(error);
            reject(error);
          });

        }
      }, 0);
    })
  }

  private bigPdfDown(ele: any, name: string, tempDiv: HTMLDivElement, size: Size) {
    return new Promise<void>(async (resolve, reject) => {
      console.log(ele.clientWidth, ele.clientHeight);
      this.allHeight = ele.clientHeight;

      let nodeList: any[] = [];
      let node = ele.firstChild;

      while (node) {
        nodeList.push(node);
        node = node.nextSibling;
      }
      nodeList = nodeList.filter((node: ChildNode) => node.nodeName !== '#comment');

      const elList = nodeList.reduce((previous: { height: number, elList: any[][] }, current: any) => {
        if (previous.height + current.clientHeight <= this.singleMaxHeight) {
          previous.elList[previous.elList.length - 1].push(current);
          previous.height += current.clientHeight;
        } else {
          previous.height = 0;
          previous.elList.push([]);
          previous.elList[previous.elList.length - 1].push(current);
          previous.height += current.clientHeight;
        }
        return previous;
      }, { height: 0, elList: [[]] }).elList;

      nodeList = [];

      const indexTemp = document.getElementById('html2canvas');
      if (!indexTemp || !indexTemp.firstChild) {
        return;
      }
      indexTemp.firstChild.childNodes.forEach(node => node.remove());
      const html2pdfBox = indexTemp.firstChild;

      let i = 0;
      const tempArr: any[] = [];
      for (let arr of elList) {
        const block: any = document.createElement('div');
        html2pdfBox.appendChild(block);
        tempArr.push(block);

        arr.forEach(item => {
          block.appendChild(item.cloneNode(true));
        });
        nodeList.push(html2pdfBox.lastChild);

        i++;
        if (elList.length === i) {
          const promiseList: any[] = [];
          nodeList.forEach(node => {
            promiseList.push(html2canvas(node, {
              allowTaint: true, useCORS: true
            }));
          });
          Promise.all(promiseList).then(result => {
            const pdf = new jsPDF('p', 'mm', size); //纵向，单位mm
            let i = 1;
            for (const canvas of result) {
              this.draw(canvas, pdf, i === result.length, size);
              i++;
            }
            pdf.save(name + '.pdf');
            tempDiv.remove();
            tempArr.forEach(item => {
              item.remove();
            })
            html2pdfBox.remove();
            this.alreadyDrawAllHeight = 0;
            resolve();
          }, error => {
            console.log('error', error);
            tempDiv.remove();
            tempArr.forEach(item => {
              item.remove();
            })
            html2pdfBox.remove();
            this.alreadyDrawAllHeight = 0;
            reject();
          });
        }
      }
    })
  }

  private allHeight = 0;
  private alreadyDrawAllHeight = 0;

  // 存放未达成一页的 page
  private IncompletePage: IncompletePage | null = null;
  private draw(canvas: any, pdf: any, isLastCanvas: boolean, size: Size) {

    const aw: number = this.paperMap[size].width - 20;  //设置显示内容的大小
    const ah: number = this.paperMap[size].height - 20;

    // pdf 一页显示的 canvas 高度
    let canvasOfPdfOnePageHeight: number = Math.floor(ah * canvas.width / aw);
    // 当前 canvas 已绘制高度
    let renderedHeight = 0;

    // 一次需要绘画的高度（对 canvas 而言）
    let paintingHeight = null;

    let page = null;
    let pageCtx = null;
    let top = 0;

    if (this.IncompletePage) {
      paintingHeight = canvasOfPdfOnePageHeight - this.IncompletePage.top;
      paintingHeight = Math.min(paintingHeight, canvas.height);

      page = this.IncompletePage.page;
      pageCtx = this.IncompletePage.ctx;
      top = this.IncompletePage.top;
    } else {
      paintingHeight = canvasOfPdfOnePageHeight;
      paintingHeight = Math.min(paintingHeight, canvas.height);

      page = document.createElement('canvas');
      page.width = canvas.width;
      if (isLastCanvas) {
        page.height = Math.min(canvasOfPdfOnePageHeight, canvas.height - renderedHeight);
      } else {
        // 最多申请需要绘画的高度，不然最后一页出现黑色背景
        page.height = Math.min(canvasOfPdfOnePageHeight, this.allHeight - this.alreadyDrawAllHeight);
      }
      pageCtx = page.getContext('2d');
      top = 0;
    }

    // 获取当前 canvas 画布
    const ctx = canvas.getContext('2d');

    do {
      pageCtx.putImageData(ctx.getImageData(0, renderedHeight, canvas.width, paintingHeight), 0, top);
      this.IncompletePage = null;
      renderedHeight += paintingHeight;
      top += paintingHeight;
      this.alreadyDrawAllHeight += paintingHeight;

      // 如果当前 canvas 未绘制完
      if (renderedHeight < canvas.height) {
        pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, aw, Math.min(ah, aw * page.height / page.width));
        pdf.addPage();

        page = document.createElement('canvas');
        page.width = canvas.width;

        if (isLastCanvas) {
          page.height = Math.min(canvasOfPdfOnePageHeight, canvas.height - renderedHeight);
        } else {
          // 最多申请需要绘画的高度，不然最后一页出现黑色背景
          page.height = Math.min(canvasOfPdfOnePageHeight, this.allHeight - this.alreadyDrawAllHeight);
        }

        pageCtx = page.getContext('2d');
        top = 0;

        paintingHeight = Math.min(canvasOfPdfOnePageHeight, canvas.height - renderedHeight);
      } else {
        if (!isLastCanvas) {
          // page 高度不足一页时
          if (top < canvasOfPdfOnePageHeight) {
            this.IncompletePage = {
              page: page,
              ctx: pageCtx,
              top: top
            }
          } else {
            pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, aw, Math.min(ah, aw * page.height / page.width));
            pdf.addPage();
          }
        } else {
          pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, aw, Math.min(ah, aw * page.height / page.width));
        }
      }
    } while (renderedHeight < canvas.height);

  }
}
