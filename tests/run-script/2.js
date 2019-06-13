global.FOO = 42
console.log("This set the FOO global")
console.log(FOO)
console.log("Waiting 10 seconds")
setTimeout(() => {
    console.log("waited 10 seconds")
}, 10000);
