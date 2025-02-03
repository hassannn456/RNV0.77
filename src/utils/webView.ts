// cspell:ignore crossorigin
export const formatHTML = (contents: string[], script?: string): string => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
          <style type="text/css">
            body {
              font-family: "Inter", sans-serif;
              font-size: 16px;
              line-height: 1.2;
            }
            .content-section {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          ${contents
            .map(section => {
              return `
              <section class="content-section">
                ${section}
              </section>
            `
            })
            .join('')}

          <script>
            ${script ?? ''}
          </script>
        
          </body>
      </html>
    `
}
