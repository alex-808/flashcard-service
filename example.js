const example1 =
    'In computing, plain text is a loose term for data (e.g. file contents) that represent only characters of readable material but not its graphical representation nor other objects (floating-point numbers, images, etc.). It may also include a limited number of "whitespace" characters that affect simple arrangement of text, such as spaces, line breaks, or tabulation characters. Plain text is different from formatted text, where style information is included; from structured text, where structural parts of the document such as paragraphs, sections, and the like are identified; and from binary files in which some portions must be interpreted as binary objects (encoded integers, real numbers, images, etc.) The term is sometimes used quite loosely, to mean files that contain only "readable" content (or just files with nothing that the speaker does not prefer). For example, that could exclude any indication of fonts or layout (such as markup, markdown, or even tabs); characters such as curly quotes, non-breaking spaces, soft hyphens, em dashes, and/or ligatures; or other things. In principle, plain text can be in any encoding, but occasionally the term is taken to imply ASCII. As Unicode-based encodings such as UTF-8 and UTF-16 become more common, that usage may be shrinking. Plain text is also sometimes used only to exclude "binary" files: those in which at least some parts of the file cannot be correctly interpreted via the character encoding in effect. For example, a file or string consisting of "hello" (in any encoding), following by 4 bytes that express a binary integer that is not a character, is a binary file. Converting a plain text file to a different character encoding does not change the meaning of the text, as long as the correct character encoding is used. However, converting a binary file to a different format may alter the interpretation of the non-textual data. According to The Unicode Standard: "Plain text is a pure sequence of character codes; plain Un-encoded text is therefore a sequence of Unicode character codes.In contrast, styled text, also known as rich text, is any text representation containing plain text plus added information such as a language identifier, font size, color, hypertext links, and so on. SGML, RTF, HTML, XML, and TeX are examples of rich text fully represented as plain text streams, interspersing plain text data with sequences of characters that represent the additional data structures."';

const example2 =
    'German mathematicians Felix Klein and Georg Cantor are credited with putting forward the idea of an international congress of mathematicians in the 1890s. The University of Chicago, which had opened in 1892, organized an International Mathematical Congress at the Chicago World Fair in 1893, where Felix Klein participated as the official German representative. The first official International Congress of Mathematicians was held in Zurich in August 1897. The organizers included such prominent mathematicians as Luigi Cremona, Felix Klein, Gösta Mittag-Leffler, Andrey Markov, and others. The congress was attended by 208 mathematicians from 16 countries, including 12 from Russia and 7 from the US. Only four were women: Iginia Massarini, Vera von Schiff, Charlotte Scott, and Charlotte Wedell.[8]';

module.exports = {
    example1: example1,
    example2: example2,
};
