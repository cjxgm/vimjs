
minify: minify-js minify-index

minify-js:
	@echo -e "\e[0;33mcreating directory \e[1;35mminjs/\e[m..."
	@mkdir -p minjs/
	@for f in *.js; do echo -e "\e[0;33mminifying \e[1;35m$$f\e[m..."; closure < $$f > minjs/$$f; done

minify-index:
	@echo -e "\e[0;33mapplying minified js for \e[1;35mindex.htm\e[m..."
	@cat index_dev.htm | sed 's/"\([^"]*\.js\)"/"minjs\/\1"/g' > index.htm

clean:
	rm -rf minjs/
	rm -f index.htm
