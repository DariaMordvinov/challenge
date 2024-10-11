import React, { useState, useEffect } from "react";

/*

for retieving URI:
there are ^= (starts with), $= (ends with) and *= (contains) notations that we can use
to find DOM elements with certain attributes
for example, document.querySelectorAll('code[data-class^="23"]') will get all code elements, where data-class
attribute is starting with 23
we can simply find all parent code nodes and then -> check each node for divs with tags ending with 93
-> check each div for spans with data-id containing 21 -> find values for all <i> elements with "char" class -> find their values

so the script goes as following:

let hiddenUrl = "";

document.querySelectorAll('code[data-class^="23"]').forEach(code => {
    let div = code.querySelector('div[data-tag$="93"]');
    if (div) {
        let span = div.querySelector('span[data-id*="21"]');
        if (span) {
            let charElement = span.querySelector('i.char');
            if (charElement && charElement.getAttribute('value')) {
                hiddenUrl += charElement.getAttribute('value')
            }
        }
    }
});

console.log(hiddenUrl);

*/

const API_URI = "https://wgg522pwivhvi5gqsn675gth3q0otdja.lambda-url.us-east-1.on.aws/756e63";


// component for rendering each character with a delay
// it renders empty string untill it the timer ends
function Character({char, index}) {
  const [wait, setWait] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWait(false)
    }, 500 * (index + 1))

    return () => clearTimeout(timeout);
  }, [])

  return <li style={{ float: "left" }}>{wait ? "" : char}</li>
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [flag, setFlag] = useState(null);

  const handleClick =  () => {
    setFlag(null)
    setIsLoading(true)
    fetch(API_URI)
      .then((response) => response.body)
      .then((body) => {
        // getReader for reading stream returned by the API
        const reader = body.getReader();
        let string = ""
        reader.read().then(function pump({ done, value }) {
          if (done) {
            // I would also delay this 2 hook calls for couple of seconds to avoid the isLoading flashing effect
            // (it can change to false too fast)
            setFlag(string)
            setIsLoading(false)
            return;
          }
          // we're reading the stream here, saving the values we get
          string += new TextDecoder().decode(value);
          return reader.read().then(pump);
        })
      .catch(err => {
        setIsLoading(false)
        console.log(err)
      })
    })
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100dvh"}}>
      {flag
      ? <ul style={{ listStyle: "none"}}>
        {flag.split("").map((char, index) => <Character key={index} char={char} index={index} />)}
      </ul>
      : isLoading
        ? <p>Loading...</p>
        : <button onClick={handleClick}>Get Flag</button>}
    </main>
  )
}

export default App
