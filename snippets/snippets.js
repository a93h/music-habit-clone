
    console.log(JSON.stringify(txt))
    var json_obj = null
    try {
      json_obj = JSON.parse(txt)
    } catch (err0) {
      try {
        json_obj = xml2json.toJson(txt, {object: true})
      } catch (err1) {
        console.warn(err0.message)
        console.trace(err0)
        console.error(err1.message)
        console.trace(err1)
      }
    }