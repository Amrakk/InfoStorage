function read(path, callback) {
  if (path) {
    callback("abc", null);
  } else {
    callback(null, "Path is not exist");
  }
}

function callback(data, err) {
  console.log("Already read");
}
read("qdqwd", callback);

/*----------------------------------------------------------------*/

try {
  const data = read("aa");
  console.log("DOC THANH CONG");
} catch (error) {
  console.log("LOI DOC");
}
