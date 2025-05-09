import {
  PartialDeep,
  RecognizerHTTPV2,
  TRecognizerHTTPV2RecognitionConfiguration,
  TServerHTTPConfiguration,
  TStroke
} from "iink-ts";


import katex from "katex";
import "katex/dist/katex.min.css";

export default function useRecognizer() {
  const server: PartialDeep<TServerHTTPConfiguration> = {
    scheme: "https",
    host: "cloud.myscript.com",
    applicationKey: "07516ef4-1466-42eb-bdb6-fb95ffcb289f",
    hmacKey: "cde8c7c1-0140-4000-bb37-2e555403338d",
  };
  const zhRecognition: PartialDeep<TRecognizerHTTPV2RecognitionConfiguration> =
    {
      lang: "zh_CN",
      type: "TEXT",
    };
  const enRecognition: PartialDeep<TRecognizerHTTPV2RecognitionConfiguration> =
    {
      lang: "en_US",
      type: "TEXT",
    };
  const mathRecognition: PartialDeep<TRecognizerHTTPV2RecognitionConfiguration> =
    {
      type: "MATH",
      math: {
        mimeTypes: ["application/x-latex"],
      },
    };
  let zhR = new RecognizerHTTPV2({ server, recognition: zhRecognition });
  let enR = new RecognizerHTTPV2({ server, recognition: enRecognition });
  let mathR = new RecognizerHTTPV2({ server, recognition: mathRecognition });
  // paths：TStroke[]  type: zh、en or math
  function send(paths, type) {
    console.log("识别", paths);
    return new Promise<string>((resolve, reject) => {
      if (type == "zh") {
        zhR.send(paths).then((exports: any) => {
          console.log("识别zh", exports);
          if (exports && exports["application/vnd.myscript.jiix"]) {
            const elements = exports["application/vnd.myscript.jiix"];
            resolve(`${JSON.stringify(elements.words)}`);
          }else{
            reject("")
          }
        });
      }

      if (type == "en") {
        enR.send(paths).then((exports: any) => {
          console.log("识别en", exports);
          if (exports && exports["application/vnd.myscript.jiix"]) {
            const elements = exports["application/vnd.myscript.jiix"];
            resolve(`<span>${JSON.stringify(elements.words)}</span>`);
          }else{
            reject("")
          }
        });
      }

      if (type == "math") {
        mathR.send(paths).then((exports: any) => {
          console.log("识别math", exports);
          if (exports && exports["application/x-latex"]) {
            const elements = exports["application/x-latex"];
            resolve(katex.renderToString(elements));
          }else{
            reject("")
          }
        });
      }
    });
  }
  return {
    send,
  };
}
