# NgxHtml2pdf

支持超过浏览器限制的图像渲染。

## 使用

### 1. 导入 NgxHtml2pdfModule

> AppModule 的 imports 中加入 NgxHtml2pdfModule

### 2. 注入 NgxHtml2pdfService

> constructor( private ngxHtml2pdfService: NgxHtml2pdfService ) { }

### 3. 调用 html2pdf 方法（promise）

> this.ngxHtml2pdfService.html2pdf(elementId: string, pdfName: string, size?: Size).then().catch()

> type Size = 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5'
