const { exec } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(cmd) {
  try {
    const { stdout, _ } = await execPromise(cmd);
    return stdout || true;
  } catch (error) {
    console.error("Command failed: ", cmd, error);
    return null;
  }
}

module.exports = async function findBeats(audioPath) {
  const outputDir = './beat_finder/output';
  const outputFile = path.join(outputDir, 'beat.txt');
  
  await fs.mkdir(outputDir, { recursive: true });

  const cmd = `.\\beat_finder\\essentia_streaming_beattracker_multifeature_mirex2013.exe "${audioPath}" "${outputFile}"`;
  
  const success = await runCommand(cmd);
  if (!success) return [];

  try {
    const data = await fs.readFile(outputFile, 'utf8');
    const beats = data.split('\n').map(b => b.trim().replace(',', '')).filter(b => b.length > 0);
    return beats;
  } catch (err) {
    console.error("Failed to read beat.txt", err);
    return [];
  }
};
