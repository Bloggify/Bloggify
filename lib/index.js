function (lien) {
            var code = parseInt((lien.pathName.match(/\/(.*)\/?/) || [])[1]);
            if (isNaN(code) || !themeObj.errors[code]) {
                return lien.end(404);
            }
            lien.file(themeObj.errors[code]);
        }// Constructor
