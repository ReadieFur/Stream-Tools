using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using AWS_Stream_Chat;

namespace AWS_Stream_Chat.Pages
{
    public class IndexModel : PageModel
    {
        public static readonly string webRoot = Program._args["webRoot"];

        public void OnGet()
        {
        }
    }
}
