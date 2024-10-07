function main() {
  // 注册扩展
  let ext = seal.ext.find("seal-fu");
  if (!ext) {
    ext = seal.ext.new("seal-fu", "Mint Cider", "0.1.0");
    seal.ext.register(ext);
  }
}

main();
