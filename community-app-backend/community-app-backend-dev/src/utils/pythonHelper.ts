import { PythonShell } from 'python-shell';

export const runPythonScript = async (scriptPath: string, args: string[]) => {
  return new Promise<string[]>((resolve, reject) => {
    let options = {
      args: args,
      pythonOptions: ['-u'],
      mode: 'text' as 'text'
    };

    PythonShell.run(scriptPath, options)
      .then(results => resolve(results))
      .catch(error => reject(error));
  });
};
