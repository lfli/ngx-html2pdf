# NgxHtml2pdf

支持超过浏览器限制的图像渲染。

## 使用

### 安装

npm i ngx-html2pdf

### 1. 导入 NgxHtml2pdfModule

> AppModule 的 imports 中加入 NgxHtml2pdfModule

### 2. 注入 NgxHtml2pdfService

> constructor( private ngxHtml2pdfService: NgxHtml2pdfService ) { }

### 3. 调用 html2pdf 方法（promise）

> this.ngxHtml2pdfService.html2pdf(elementId: string, pdfName: string, size?: Size).then().catch()

> type Size = 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5'

## 样式

> 请将 elementId 对应元素里的 class 样式放入全局样式 global.scss 里，例如

```
<div id="my-pdf">
      <div class="header">
      </div>

      <divclass="content">
      </div>

      <div class="footer">
      </div>
</div>

global.scss 文件
#my-pdf {
    display: flex;
    flex-direction: column;

    .header {
      height: 5vw;
      background-color: rgba(0, 0, 0, 0.2);
    }

    .content {
      padding: 10px;
      background-color: white;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 1vw;
      flex: 1;
      overflow-y: auto;
    }

    .footer {
      padding: 10px;
      text-align: center;
      background-color: white;
    }
}
```
