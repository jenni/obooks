const CONTENT_URLS = [
    "https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Text/kindle_split_000.html",
    "https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Text/kindle_split_001.html",
    "https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Text/kindle_split_002.html"
]



const CONTENTS = [
    "<div id=\"sbo-rt-content\" class=\"calibre\"><h1 class=\"calibre1\" id=\"calibre_pb_0\">Grokking Algorithms: An illustrated guide for programmers and other curious people</h1>\n" +
    "\n" +
    "  <h4 class=\"center\">Aditya Y. Bhargava</h4>\n" +
    "\n" +
    "  <p class=\"center1\"><img alt=\"\" class=\"calibre2\" src=\"/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Images/logo.jpg\" width=\"144\" height=\"21\"></p>\n" +
    "</div>",


    "<div id=\"sbo-rt-content\" class=\"calibre\"><h2 class=\"part\" id=\"copyrightp1g\"><a class=\"calibre3\" id=\"start\"></a>Copyright</h2>\n" +
    "\n" +
    "  <p class=\"noind\">For online information and ordering of this and other Manning books, please visit <a class=\"calibre4\" href=\"http://www.manning.com\">www.manning.com</a>. The publisher offers discounts on this book when ordered in quantity. For more information, please contact</p>\n" +
    "  <pre class=\"calibre5\">       Special Sales Department\n" +
    "       Manning Publications Co.\n" +
    "       20 Baldwin Road, PO Box 761\n" +
    "       Shelter Island, NY 11964\n" +
    "       Email: <i class=\"calibre6\">orders@manning.com</i></pre>\n" +
    "\n" +
    "  <p class=\"noind\">©2016 by Manning Publications Co. All rights reserved.</p>\n" +
    "\n" +
    "  <p class=\"noind\">No part of this publication may be reproduced, stored in a retrieval system, or transmitted, in any form or by means electronic, mechanical, photocopying, or otherwise, without prior written permission of the publisher.</p>\n" +
    "\n" +
    "  <p class=\"noind\">Many of the designations used by manufacturers and sellers to distinguish their products are claimed as trademarks. Where those designations appear in the book, and Manning Publications was aware of a trademark claim, the designations have been printed in initial caps or all caps.</p>\n" +
    "\n" +
    "  <p class=\"noind\"><img alt=\"\" class=\"calibre2\" src=\"/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Images/common01.jpg\" width=\"15\" height=\"15\"> Recognizing the importance of preserving what has been written, it is Manning’s policy to have the books we publish printed on acid-free paper, and we exert our best efforts to that end. Recognizing also our responsibility to conserve the resources of our planet, Manning books are printed on paper that is at least 15 percent recycled and processed without the use of elemental chlorine.</p>\n" +
    "\n" +
    "  <table cellpadding=\"8\" cellspacing=\"5\" class=\"calibre7\" frame=\"void\" rules=\"none\" width=\"100%\">\n" +
    "    <colgroup class=\"calibre8\" span=\"2\">\n" +
    "      <col class=\"calibre9\" width=\"100\">\n" +
    "      <col class=\"calibre9\" width=\"300\">\n" +
    "    </colgroup>\n" +
    "\n" +
    "    <tbody class=\"calibre10\">\n" +
    "      <tr class=\"calibre11\">\n" +
    "        <td class=\"doctablecell\"><img alt=\"\" class=\"calibre2\" src=\"/api/v2/epubs/urn:orm:book:9781617292231/files/OEBPS/Images/common02.jpg\" width=\"46\" height=\"32\"></td>\n" +
    "\n" +
    "        <td class=\"doctablecell\">\n" +
    "          <pre class=\"calibre12\">Manning Publications Co.\n" +
    "20 Baldwin Road\n" +
    "Shelter Island, NY 11964</pre>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </tbody>\n" +
    "  </table>\n" +
    "  <pre class=\"calibre5\">Development editor: Jennifer Stout\n" +
    "Technical development editor: Damien White\n" +
    "Project manager: Tiffany Taylor\n" +
    "Copyeditor: Tiffany Taylor\n" +
    "Technical proofreader: Jean-François Morin\n" +
    "Typesetter: Leslie Haimes\n" +
    "Cover and interior design: Leslie Haimes\n" +
    "Illustrations by the author\n" +
    "</pre>\n" +
    "\n" +
    "  <p class=\"noind\">ISBN: 9781617292231</p>\n" +
    "\n" +
    "  <p class=\"noind\">Printed in the United States of America</p>\n" +
    "\n" +
    "  <p class=\"noind\">1 2 3 4 5 6 7 8 9 10 – EBM – 21 20 19 18 17 16</p>\n" +
    "\n" +
    "  <h3 class=\"calibre13\" id=\"ded01\"><a class=\"calibre3\" id=\"ded01__title\"></a> </h3>\n" +
    "\n" +
    "  <p class=\"noind\"><i class=\"calibre6\">For my parents, Sangeeta and Yogesh</i></p>\n" +
    "</div>",


    "<div id=\"sbo-rt-content\" class=\"calibre\"><h2 class=\"part\" id=\"btoc\">Brief Table of Contents</h2>\n" +
    "\n" +
    "  <blockquote class=\"toc\">\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_001.html#copyrightp1g\">Copyright</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"#btoc\">Brief Table of Contents</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_003.html#toc\">Table of Contents</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_004.html#pref01\">Preface</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_005.html#pref02\">Acknowledgments</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_006.html#pref03\">About this Book</a><br class=\"calibre14\"></p>\n" +
    "  </blockquote>\n" +
    "\n" +
    "  <blockquote class=\"toc\">\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_007.html#ch01\">Chapter 1. Introduction to Algorithms</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_008.html#ch02\">Chapter 2. Selection Sort</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_009.html#ch03\">Chapter 3. Recursion</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_010.html#ch04\">Chapter 4. Quicksort</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_011.html#ch05\">Chapter 5. Hash Tables</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_012.html#ch06\">Chapter 6. Breadth-first Search</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_013.html#ch07\">Chapter 7. Dijkstra’s algorithm</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_014.html#ch08\">Chapter 8. Greedy algorithms</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_015.html#ch09\">Chapter 9. Dynamic programming</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_016.html#ch10\">Chapter 10. K-nearest neighbors</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_017.html#ch11\">Chapter 11. Where to go next</a><br class=\"calibre14\"></p>\n" +
    "\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_018.html#app01\"> Answers to Exercises</a><br class=\"calibre14\"></p>\n" +
    "  </blockquote>\n" +
    "\n" +
    "  <blockquote class=\"calibre15\">\n" +
    "    <p class=\"ind\"><a class=\"calibre4\" href=\"../Text/kindle_split_019.html#MainIndex\">Index</a><br class=\"calibre14\"></p>\n" +
    "  </blockquote>\n" +
    "</div>"
]

module.exports = {
    CONTENTS,
    CONTENT_URLS
}