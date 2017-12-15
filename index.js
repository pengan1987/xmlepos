//const escpos = require('escpos');
import * as escpos from 'escpos';
import * as libxmljs from 'libxmljs';
//const device = new escpos.Network('192.168.1.50');


const xml = "<page><center><tall><span>Andy's</span></tall><text>shop</text><txt>Tue October17 2017 18:11:50</txt><txt>Order: 2</txt></center><txt>======================================</txt><bold><txt>4 x pepsi</txt><right><txt>$1.99</txt></right><txt>1 x coke</txt><right><txt>$1.85</txt></right></bold><txt>=====================================</txt><bold><right><txt>Subtotal:$9.81</txt><txt>Tax:$0.49</txt></right></bold><txt>====================================</txt><bold><right>Total:$10.30</right></bold><br /><br /><cut /></page>";

export default class XmlEposCoder {

  constructor() {
    this.device =  escpos.Console(consoleHandler);
    this.printer = new escpos.Printer(this.device);
  }

  decodeXml(xml) {
    let xmlDoc = libxmljs.parseXml(xml);
    let root = xmlDoc.root();
    device.open(function () {
      parseNode(root, printer);

      printer.close();
    });
  }

  consoleHandler(data) {
    let str = data.toString('ascii');
    console.log(str);
  }

  parseNode(xmlNode, targetPrinter) {

    let children = xmlNode.childNodes();

    appendNodeHead(xmlNode, targetPrinter);
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        let childNode = children[i];
        parseNode(childNode, targetPrinter);
      }
    } else {
      let text = xmlNode.text();
      let parentName = xmlNode.parent().name();
      if (text.length > 0 && parentName != 'span') {
        targetPrinter.text(text);
      }
    }
    appendNodeTail(xmlNode, targetPrinter);

  }

  appendNodeHead(xmlNode, targetPrinter) {
    let type = xmlNode.name();
    //console.log(type);
    if (type == 'center') {
      targetPrinter.align('CT');
    }
    if (type == 'right') {
      targetPrinter.align('RT');
    }
    if (type == 'bold') {
      targetPrinter.style('B');
    }
    if (type == 'br') {
      targetPrinter.text('')
    }
    if (type == 'cut') {
      targetPrinter.cut();
    }
    if (type == "span") {
      let text = xmlNode.text();
      targetPrinter.pureText(text);
    }
    if (type == "tall") {
      targetPrinter.size(1, 2);
    }
    if (type == "wide") {
      targetPrinter.size(2, 1);
    }
    if (type == "quadruple") {
      targetPrinter.size(2, 2);
    }
  }

  appendNodeTail(xmlNode, targetPrinter) {
    let type = xmlNode.name();

    if (type == 'center') {
      targetPrinter.align('lt');
    }
    if (type == 'right') {
      targetPrinter.align('lT');
    }
    if (type == 'bold') {
      targetPrinter.style('NORMAL');
    }
    if (type == "tall" || type == "wide" || type == "quadruple") {
      targetPrinter.size(1, 1);
    }
  }

}