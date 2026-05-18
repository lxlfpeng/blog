const isWin = process.platform === 'win32';
const path = require('path');
const { validateDocs } = require('./validateDocs');
const args = process.argv.slice(2)
const scriptType = args[0]

if (scriptType === 'dev' || scriptType === 'build') {
  const issues = validateDocs(path.resolve(__dirname, '../docs'));
  if (issues.length) {
    console.log('\x1b[31m', '\n[vdoing] 文档检查失败：\n')
    issues.forEach(issue => console.log('\x1b[31m', `- ${issue}`))
    process.exit(1)
  }
}

// 如果是 windows 平台
if (isWin) {
  const {dev: devScriptStr, build: buildScriptStr} = require('../package.json').scripts
  const fRed = "\x1b[31m"

  const warnFn = (type) => {
    console.log(fRed,
      `\n[vdoing] 提示：由于您使用的是 windows 系统，请使用 ${type}:win 运行，否则运行失败。 \n`
    )
    process.exit(1)
  }

  // 当前运行的是dev脚本 且 脚本前端是'export'
  if (scriptType === 'dev' && devScriptStr.startsWith('export')) {
    warnFn('dev')
  }

  // 当前运行的是build脚本 且 脚本前端是'export'
  if (scriptType === 'build' && buildScriptStr.startsWith('export')) {
    warnFn('build')
  }
}
