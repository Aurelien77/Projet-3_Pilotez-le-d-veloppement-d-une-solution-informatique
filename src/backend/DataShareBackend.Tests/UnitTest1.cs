using Xunit;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
    public class UnitTest1
    {
        private readonly ITestOutputHelper _output;

        public UnitTest1(ITestOutputHelper output)
        {
            _output = output;
        }

        [Fact]
        public void TestConsoleOutput()
        {
            _output.WriteLine("Hello World of testS !");
            Assert.True(true);
        }
    } 
} 
