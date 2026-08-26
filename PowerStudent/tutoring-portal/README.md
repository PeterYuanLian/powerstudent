# 补习班学生门户

学生用学号+密码登录，查看自己的课程、成绩、作业；老师用管理密码登录后台，手动录入/修改数据。

技术栈：Next.js（部署在 Vercel 免费套餐） + Supabase（免费 Postgres 数据库）。全程不花钱，除非你想买自定义域名。

## 一、准备 Supabase 数据库（免费）

1. 打开 https://supabase.com ，注册并新建一个项目（New Project），数据库密码随便设一个记住即可。
2. 项目建好后，左侧菜单进入 **SQL Editor**，新建一个查询，把本项目根目录下 `supabase-schema.sql` 的全部内容粘贴进去，点 **Run**。这样五张表（students / courses / enrollments / assignments / assignment_scores）就建好了。
3. 左侧菜单进入 **Project Settings → API**，你会看到：
   - `Project URL` → 对应下面的 `SUPABASE_URL`
   - `service_role` 密钥（不是 `anon` 密钥！）→ 对应下面的 `SUPABASE_SERVICE_ROLE_KEY`

   `service_role` 密钥拥有完整数据库权限，**不要**把它写进前端代码或公开仓库，本项目只在服务器端使用它，是安全的。

## 二、把代码放到 GitHub

1. 在 GitHub 新建一个空仓库（不要初始化 README）。
2. 在这个项目文件夹里执行：
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin 你的仓库地址
   git push -u origin main
   ```

## 三、部署到 Vercel（免费）

1. 打开 https://vercel.com ，用 GitHub 账号登录。
2. 点 **Add New → Project**，选择刚才推送的仓库，点 Import。
3. 在 **Environment Variables** 里添加 4 个变量（值分别来自上面的步骤和你自己设定）：

   | 变量名 | 值 |
   |---|---|
   | `SUPABASE_URL` | Supabase 项目的 Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase 的 service_role 密钥 |
   | `ADMIN_PASSWORD` | 你自己设的管理后台密码 |
   | `AUTH_SECRET` | 一串随机字符串（本地终端跑 `openssl rand -base64 32` 生成一个即可） |

4. 点击 **Deploy**，等一两分钟部署完成，Vercel 会给你一个类似 `你的项目名.vercel.app` 的免费网址，这就是你可以直接分享给学生的网址。

之后如果想改用自己的域名（比如 `grades.你的补习班.com`），到 Vercel 项目的 **Settings → Domains** 里添加即可，Vercel 会告诉你要在域名服务商那边加哪些 DNS 记录。

## 四、开始使用

1. 打开你的网址，点「管理后台」，用 `ADMIN_PASSWORD` 登录。
2. 在「课程」页添加课程，在「学生」页添加学生（学号 + 姓名 + 初始密码，密码是你随便定的，之后学生可以让你帮忙重置，但目前没有学生自助改密码的功能）。
3. 在「成绩」页把学生和课程关联起来并填写成绩，在「作业」页添加作业并登记每个学生的得分/状态。
4. 把网址和各自的学号、密码发给学生，他们打开首页点「学生登录」即可查看自己的信息。

## 本地开发（可选）

如果你想在自己电脑上先试运行：

```bash
npm install
cp .env.example .env.local   # 然后把里面的值换成你自己的
npm run dev
```

访问 http://localhost:3000 即可。

## 后续可以扩展的方向

- 学生自助修改密码
- 邮件/短信通知新成绩或新作业
- 按学生批量导入（比如从 Excel 表格）
- 给成绩加图表统计
