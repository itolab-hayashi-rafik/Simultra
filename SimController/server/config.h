#ifndef CONFIG_H
#define CONFIG_H

#include "atypes.h"
#include "utils.h"
#include "debug.h"
 
#define ___DEBUG___ 1


char me[] = "RafikMe"; // TODO move

void load_config(char* filename, char** json_string)
{
   long length;
   char* buffer = 0;
   FILE * file = fopen (filename, "rb");
   
   if (file)
    {
      fseek (file, 0, SEEK_END);
      length = ftell (file);
      fseek (file, 0, SEEK_SET);
      
      buffer = malloc (length);
      
      if (buffer)
      {
	fread (buffer, 1, length, file);
      }
      
      *json_string = malloc(strlen(buffer)+1);
      strcpy(*json_string, buffer);

      fclose (file);
    }
    else
    {
       printf("Cannot open file %s\n", filename);
    }
}

/******************************************************************************************
 * Stores the JSON conf in node_t attray
 * returns the number of nodes
 **/

int set_nodes(node_t** nodes,
              char* buffer,
              int* port)
{
    int k,
        m = -1,
        i;
    int listening_port = -1;
  
    if (buffer)
    {
	char* out;
	cJSON *json = cJSON_Parse(buffer);
	
	if (!json)
	{
            printf("Error before: <%s>\n",cJSON_GetErrorPtr());
	}
	else
	{		
	    cJSON *item = json->child;
	    cJSON* subitem = cJSON_GetArrayItem(item, 0);

	    if (!strcmp(subitem->string, "Listener"))
	    {
		out = cJSON_Print(subitem);
                sscanf(out, "%d", & listening_port );

                #if ___DEBUG___
                    debug("  Listening Port = %d", listening_port);
                #endif
	    }
            
	    (*nodes) = (node_t*) malloc(MAX_NODES * sizeof(node_t*));
            
            for(k = 0, item = item->next; item ; item = item->next, k++)
	    {
                debug(" ____Node %d____________________________", k);

		m = cJSON_GetArraySize(item);                
                nodes[k] = (node_t*) malloc(m * sizeof(node_t));

		for ( i = 0 ; i < m ; i++ )
		{
                    cJSON* subitem = cJSON_GetArrayItem(item, i);
                
		    if (!strcmp(subitem->string, "Name"))
		    {
			    out = cJSON_Print(subitem);
			    (*nodes)[k].name = malloc(strlen(out)+1);
			    sscanf(out, "%s", (*nodes)[k].name);
		    }
		    else if (!strcmp(subitem->string, "IP"))
		    {
			    out = cJSON_Print(subitem);
			    (*nodes)[k].ip = malloc(strlen(out)+1);
			    sscanf(out, "%s", (*nodes)[k].ip);
		    }
		    else if (!strcmp(subitem->string, "Port"))
		    {
			    out = cJSON_Print(subitem);
			    sscanf(out, "%d", & (*nodes)[k].port);
		    }
		    else if (!strcmp(subitem->string, "Delay"))
		    {
			    out = cJSON_Print(subitem);
			    sscanf(out, "%d", & (*nodes)[k].delay);
		    }
		} // i
	
	    #if ___DEBUG___
		debug("   Name = %s", (*nodes)[k].name);
		debug("   Port = %d", (*nodes)[k].port);
		debug("   IP   = %s", (*nodes)[k].ip);
		debug("   Delay = %d", (*nodes)[k].delay);
	    #endif
	    
            
	    } // k
            
            
	    free(out);
	    cJSON_Delete(json);
	}
    }
    else
    {
	printf ("[%s] empty buffer !\n", me);
	exit(-1);
    }
    
    *port = listening_port;
    
    return k;        
}


#endif
