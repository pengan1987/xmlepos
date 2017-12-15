//const escpos = require('escpos');
const escpos = require('escpos');
libxmljs = require('libxmljs');
//const device = new escpos.Network('192.168.1.50');


const xml = "<page><center><tall><span>Andy's</span></tall><text>shop</text><txt>Tue October17 2017 18:11:50</txt><txt>Order: 2</txt></center><txt>======================================</txt><bold><txt>4 x pepsi</txt><right><txt>$1.99</txt></right><txt>1 x coke</txt><right><txt>$1.85</txt></right></bold><txt>=====================================</txt><bold><right><txt>Subtotal:$9.81</txt><txt>Tax:$0.49</txt></right></bold><txt>====================================</txt><bold><right>Total:$10.30</right></bold><br /><br /><cut /></page>";


function XmlEposCoder(consoleHandler) {
  this.device = new escpos.Console(consoleHandler);
  this.printer = new escpos.Printer(this.device);
}


XmlEposCoder.prototype.appendNodeHead = function (xmlNode) {
  let type = xmlNode.name();
  //console.log(type);
  if (type == 'center') {
    this.printer.align('CT');
  }
  if (type == 'right') {
    this.printer.align('RT');
  }
  if (type == 'bold') {
    this.printer.style('B');
  }
  if (type == 'br') {
    this.printer.text('')
  }
  if (type == 'cut') {
    this.printer.cut();
  }
  if (type == "span") {
    let text = xmlNode.text();
    this.printer.pureText(text);
  }
  if (type == "tall") {
    this.printer.size(1, 2);
  }
  if (type == "wide") {
    this.printer.size(2, 1);
  }
  if (type == "quadruple") {
    this.printer.size(2, 2);
  }
}

XmlEposCoder.prototype.appendNodeTail = function (xmlNode) {
  let type = xmlNode.name();

  if (type == 'center') {
    this.printer.align('lt');
  }
  if (type == 'right') {
    this.printer.align('lT');
  }
  if (type == 'bold') {
    this.printer.style('NORMAL');
  }
  if (type == "tall" || type == "wide" || type == "quadruple") {
    this.printer.size(1, 1);
  }
}

XmlEposCoder.prototype.decodeXml = function (xml) {
  let xmlDoc = libxmljs.parseXml(xml);
  let root = xmlDoc.root();
  let parseNode = this.parseNode;
  let that = this;
  this.device.open(function () {
    that.parseNode(root);
    that.printer.close();
  });
}

XmlEposCoder.prototype.parseNode = function (xmlNode) {

  let children = xmlNode.childNodes();

  this.appendNodeHead(xmlNode);
  if (children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      let childNode = children[i];
      this.parseNode(childNode);
    }
  } else {
    let text = xmlNode.text();
    let parentName = xmlNode.parent().name();
    if (text.length > 0 && parentName != 'span') {
      this.printer.text(text);
    }
  }
  this.appendNodeTail(xmlNode);

}

var handler = function (data) {
  let str = data.toString('ascii');
  console.log(str);
};

let coder = new XmlEposCoder(handler);
coder.decodeXml(xml);