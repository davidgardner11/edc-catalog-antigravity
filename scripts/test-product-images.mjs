async function test() {
  const url = 'https://www.goruck.com/products/gr1.json';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });
  const data = await res.json();
  console.log('Title:', data.product.title);
  console.log('Image count:', data.product.images.length);
  for (let i = 0; i < Math.min(5, data.product.images.length); i++) {
    console.log(`Image ${i + 1}: ${data.product.images[i].src}`);
  }
}
test().catch(console.error);
