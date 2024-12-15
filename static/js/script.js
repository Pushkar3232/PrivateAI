// Example POST method implementation:
async function postData(url = "", data = {}) { 
  const response = await fetch(url, {
    method: "POST", headers: {
      "Content-Type": "application/json", 
    }, body: JSON.stringify(data),  
  });
  return response.json(); 
}



sendButton.addEventListener("click",async()=>{
  
  var questionInput = document.getElementById("questionInput").value;
  document.getElementById("question").innerHTML = questionInput;

  document.getElementById("questionInput").value="";
  document.querySelector(".right2").style.display = "block"
  document.querySelector(".right1").style.display = "none"


  let result = await postData("/api",{"question": questionInput}) 
  console.log(result);

  let formatted = result.result
                .replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
                .replace(/(?<!\*)\*(.*?)\*(?!\*)/g, '<h2>$1</h2>') 
                .replace(/\n/g, '<br>'); 
            
     
  document.getElementById("solution").innerHTML= formatted;



})

