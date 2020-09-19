Sails Tutorial for iOS
================================

How to get started developing full stack applications with Sails
-------------------------

We are going to make an application for the iPhone in XCode v4.6 that displays messages from the Sails server to the iPhone. To get started, install Sails:

*Click [here to get started with installing Sails](https://github.com/balderdashy/sails).*

Now that you have Sails installed, let's create a Sails project. The first thing we will do is create the Xcode project. In Xcode, create a Single View application, and give it the name SampleAppSails.

Open Terminal, and go to your Xcode project's folder. Mine was on the desktop, and my path was ```/User/aug2uag/desktop/SampleAppSails/```. Once you are in your Xcode project directory, create the Sails application. Note, that we could have initially created the Sails application, and included the Xcode project in that directory. Since the Sails directory includes multiple other directories, I opted to organize it as mentioned above.

To create your new Sails project, in terminal type:

    sails new sailsXcodeProject

You will notice Sails installs with many features right away. Among these are automagically generated RESTful API requests that we will be using for our application. Let's open our Sails project files, and inspect these elements.

In ```/config``` you will find the filename controllers.js that includes instructions for a blueprint. The blueprint is a prototype for the actual Sails application. Here, the blueprint for the app is specified to include:

    // Automatic REST blueprints enabled?
    // e.g.
    // 'get /:controller/:id?'
    // 'post /:controller'
    // 'put /:controller/:id'
    // 'delete /:controller/:id'
    rest: true

If you like to disable the default methods, and write your own custom methods, then you can set the parameter to false.

For the purposes of the application we are developing, the default controller methods will be selected to perform our actions. Specifically, we will want to:

* POST a message to the server, that includes our text and userId
* GET the messages from the server, and display them as a list on the iPhone

We will create a single Messages entity:

    sails g Messages

This has created the Messages model, and controller. Let's open the model from the /api directory of your Sails application, and add the following attributes:

    module.exports = {
        attributes: {
        text: 'string'
        }
    };

This says that we will be storing Messages objects on the server, and that the messages object will consist of text and timestamp. Note that a timestamp will be generated automatically each time a new object is made. For now, let's move on, and take a look at the MessagesController.js file found in the ```/api``` directory of your Sails application:

    module.exports = {
        sayHello: function (req, res) {
        res.send('hello world!');
        }
    };

There is a simple Hello World function named ```sayHello``` to demonstrate the functional style language used in Sails that is common to Node. Each function operates in a block, and that makes it possible for the program to continue without the need for the result of the function to return. We will be sticking with the default controller methods, and those are abstracted away from us, unless we had decided to write our own in the controller.

We can demonstrate the use of the functions, by calling a HTTP GET request to the server. Since the function resides in the MessagesController in the /messages route, it will be accessible via the route ```http://localhost:1337/messages/sayHello``` and you can make a request or use a REST client such as 'Postman' to demonstrate the output.

Let's link up a Mongo database to hold our information. I already have my Mongo shell running on port 27017, fire up your mongod, and in the /config/session.js file add the following:

    module.exports.session = {
      secret: '7309c3e86f54d10dbcdf2b4e113ab393',
      adapter: 'mongo',
      host: 'localhost',
      port: 27017,
      db: 'sails',
      collection: 'sessions'
    };

We are telling Sails that for our project (secret: value that is automatically generated for each application), we are going to be using (adapter: mongo), in path (host & port: local/1337), a database named 'sails' that is stored with other databases in a collection.

Save everything, and run your Sails application, and you should see your Sails application operating on localhost:1337. You can also verify your app is running by opening a new shell, and running:```curl http://localhost:1337```

Let's move on, and create the iPhone client.

Your SampleApplicationSails.xcodeproj should be open on XCode. Go to your storyboard or xib file, and add:
* tableView
* textField
* button

Connect these UI elements to the @interface of the ViewController.m file. Make sure you connect your tableView data source outlet to the ViewController. Create an NSArray instance variable, and your ViewController.m @interface should look something like:

    @interface ViewController () 
    {
        SocketIO* socketIO;
    
        __weak IBOutlet UITextField *oTextField;
        __weak IBOutlet UITableView *oTableView;

        NSArray* sailsArray;
    }

    - (IBAction)submitText:(id)sender;

    @end

Create your tableViewDataSource methods, with logic to handle the empty array (i.e. since it may be initially empty):

    #pragma mark-table view data source
    - (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
    {
        return 1;
    }


    - (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
    {
        if (sailsArray.count == 0) {
            return 1;
        }
        return sailsArray.count;
    }


    - (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
    {
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"id"];
        
        if (cell == nil) {
            cell = [[UITableViewCell alloc]initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"id"];
        }
        
        if (sailsArray.count == 0) {
            cell.textLabel.text = @"array does not exist (yet)";
            return cell;
        }
        //declare string, assign to value at indexPath from array
        //array may be made from [dictionary allKeys];
        NSString* string = [[sailsArray objectAtIndex:indexPath.row] valueForKey:@"text"];
        NSString* subString = [[sailsArray objectAtIndex:indexPath.row] valueForKey:@"createdAt"];
        
        //set string to textLabel of cell
        [cell.textLabel setText:string];
        [cell.detailTextLabel setText:subString];
        
        return cell;
    }

To connect to our server (that should be running in the background), we need to create a socket to communicate to the server, and establish connection to the server's controller methods. Since Sails ships with Socket.io, we will establish the socket with Socket.io for Objective-C. 
*Add the Socket.io files from [Socket.IO / Objective C Library on Github](href=https://github.com/pkyeck/socket.IO-objc).*

To your ViewController.h, add:

    #import "SocketIO.h"

Make ViewController conform to the SocketIO delegate methods by adding SocketIODelegate next to your ViewController.

In your ViewController.m file, create a SocketIO instance variable name socketIO. In the ViewController.m @implementation viewDidLoad, add the following:

    socketIO = [[SocketIO alloc] initWithDelegate:self];
    [socketIO connectToHost:@"localhost" onPort:1337];

Run your Xcode project, and let's see what happens. Take a look at your shell running your Sails application, and you will notice that we received an error that no handshake occured. To address this, we will make a call to the Sails application prior to establishing the socket. In your ViewController.m, add the following before your code that instantiates your SocketIO object:

    //handshake
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:1337/"] cachePolicy:NSURLRequestReloadIgnoringLocalAndRemoteCacheData timeoutInterval:10];
    
    [request setHTTPMethod: @"GET"];
    
    NSError *requestError;
    NSURLResponse *urlResponse = nil;
    NSData *response1 = [NSURLConnection sendSynchronousRequest:request returningResponse:&urlResponse error:&requestError];```

Also add the following to view the results of the GET request:

    //converts response to string (index.html)
    NSString* stringFromData = [[NSString alloc] initWithData:response1 encoding:NSUTF8StringEncoding];
    NSLog(@"data converted to string ==> string = %@", stringFromData);

Run your Xcode project again, and you should see a log that displays the contents of your ```/views/home/index.ejs``` file in your Sails directory.

We will send a POST request to the server for the message we will type in our TextField. We will limit the size of our input by using the UITextField delegate method:

    - (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string;

In your viewDidLoad set the textField delegate to self, and in the ViewController.m file, add the following:

    - (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    NSUInteger newLength = [textField.text length] + [string length] - range.length;
    if (newLength>30) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Your Text" message:@"is too lengthy" delegate:self cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
        [alert show];
        return NO;
    }
    return YES;
    }

We are limiting the textField to 30 characters, and sending an alert if the count is higher than our limit. So once we have that in place, we can create our submit POST action. To your button action method, add the following:

    #pragma mark - textField delegate
    - (IBAction)submitText:(id)sender
    {
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:1337/messages"]];
        NSString* inputString = oTextField.text;
        NSString *params = [[NSString alloc] initWithFormat:@"text=%@", inputString];
        oTextField.text = nil;
        [request setHTTPMethod:@"POST"];
        [request setHTTPBody:[params dataUsingEncoding:NSUTF8StringEncoding]];
        [[NSURLConnection alloc] initWithRequest:request delegate:self]; 
    }

We will evaluate the response by logging it to our console via the NSURLConnection delegate. Declare a NSMutableData variable to your ViewController.m @interface. Add the following to implement your NSURLConnection delegate:

    #pragma mark - NSURLConnectionDelegate
    -(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
        mutableData = [NSMutableData data];
    }

    -(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
        [mutableData appendData:data];
    }

    -(void)connectionDidFinishLoading:(NSURLConnection *)connection {
        NSLog(@"response => %@",[[NSString alloc] initWithData:mutableData encoding:NSUTF8StringEncoding]);
        
    }

    -(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
        NSLog(@"Error");
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error" message:error.localizedDescription delegate:self cancelButtonTitle:nil otherButtonTitles:@"OK", nil];
        [alert show];
    }

Run your Xcode project again, and you should see the status of your POST request to the server.

Now that we can access when the POST request did finish, we will call the server to recieve a list of the messages on the server to display on the tableView. To do this, we will send a GET request to the Messages controller of our Sails application, and assign the result to our NSArray variable we defined a while back. When we refresh our tableView, the results are now displayed.

In Summary
----------
Sails is an amazingly efficient, and user-friendly technology to turn your iOS applications in to something so much more. I hope this tutorial was a chance for getting your feet wet in iOS with Sails. For more references, please browse the online documentation. Cheers!
