# NgxHtml2pdf

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.1.

## 使用

### 1. 导入 NgxHtml2pdfModule

> AppModule 的 imports 中加入 NgxHtml2pdfModule

### 2. 注入 NgxHtml2pdfService

> constructor( private ngxHtml2pdfService: NgxHtml2pdfService ) { }

### 3. 调用 html2pdf 方法（promise）

> this.ngxHtml2pdfService.html2pdf(elementId: string, pdfName: string).then().catch()

## 注意

> 支持超过浏览器限制的图像渲染。

> 如果 elementId 元素的 height 超过 15000px，请将 elementId 元素的每个一级子元素占据一整行的宽度。
