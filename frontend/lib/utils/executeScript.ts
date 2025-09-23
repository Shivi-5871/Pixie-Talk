import { exec } from "child_process";
import path from "path";

export const executePythonScript = (
  scriptName: string,
  args: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", scriptName);
    
    const command = `python "${scriptPath}" ${args.join(" ")}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution Error: ${error.message}`);
        reject(`Error: ${error.message}`);
      } else if (stderr) {
        console.error(`Script Error: ${stderr}`);
        reject(`Error: ${stderr}`);
      } else {
        console.log(`Output: ${stdout}`);
        resolve(stdout);
      }
    });
  });
};
